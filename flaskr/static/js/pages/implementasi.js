let resultMap;
let polyline;
const pageContent = [
  {
    title: "Pilih Destinasi",
    subtitle: "Pilih Titik yang akan dikunjungi",
    get content() {
      return $("#page1").html();
    },
    onLoad() {
      $.each(cloud.get("destinasi").data, function (i, v) {
        $(".choose-wrapper").append(`<div class="choose-item waves-effect waves-light" data-id="${v.id}"><p>${v.nama}</p><small>${v.distrik.nama}</small></div>`);
      });
      $(".f-button").on("click", function () {
        let activated = true;
        $.each($(".choose-item"), function (u, e) {
          if ($(this).hasClass("active") == false) activated = false;
        });
        activated ? $(".choose-item").removeClass("active") : $(".choose-item").addClass("active");
        activated ? $(".f-button").removeClass("grey") : $(".f-button").addClass("grey");
      });
      console.log(pageMeta.items);
      pageMeta.items.forEach((item) => {
        $(`.choose-item[data-id="${item}"]`).addClass("active");
      });
    },
    onNext() {
      let items = new Set();
      $.each($(".choose-item"), function (u, e) {
        if ($(this).hasClass("active")) items.add($(this).data("id"));
      });
      if (items.size < 2) {
        Toast.fire({
          icon: "error",
          title: "Pilih lebih dari 1 destinasi",
        });
        return false;
      }
      pageMeta.items = items;
      return true;
    },
  },
  {
    title: "Inisialisasi Jarak",
    subtitle: "Tunggu sebentar ya, dari setiap titik destinasi yang ingin kamu kunjungi, kami akan menginisialisasikan jaraknya terlebih dahulu",
    get content() {
      return $("#page2").html();
    },
    onLoad() {
      $(".btn-prev").attr("disabled", true);
      $(".btn-next").attr("disabled", true);
      let waiters = [];
      for (const [asal, tIter] of pageMeta.items3D) {
        for (const tujuan of tIter) {
          if (cloud.get("rute").data.find((x) => x.id_asal == asal && x.id_tujuan == tujuan) == undefined) waiters.push([asal, tujuan]);
        }
      }
      $.each(waiters, async function (i, [a, t]) {
        done = 0;
        asal = cloud.get("destinasi").data.find((x) => x.id == a);
        tujuan = cloud.get("destinasi").data.find((x) => x.id == t);
        $.ajax({
          url: baseOSRM + `${asal.longitude},${asal.latitude};${tujuan.longitude},${tujuan.latitude}`,
          type: "GET",
          data: {
            geometries: "geojson",
            overview: "full",
          },
          beforeSend: function () {
            $(".center-wrapper p").fadeOut(400, function () {
              $(this).text(`Mengambil jarak dari ${asal.nama} ke ${tujuan.nama}`).fadeIn(400);
            });
          },
          success: async function (osrm) {
            if (osrm.code == "Ok") {
              await $.ajax({
                type: "POST",
                url: "/api/rute",
                data: {
                  id_asal: a,
                  id_tujuan: t,
                  jarak: osrm.routes[0].distance,
                  path: JSON.stringify(osrm.routes[0].geometry.coordinates),
                },
              });
            }
            // to stop the loop loader
            if (++done == waiters.length) {
              $(".center-wrapper p").fadeOut(400, function () {
                $(".preloader-wrapper").fadeOut(400, function () {
                  $(this).remove();
                  $(".center-wrapper").prepend(`<p class="green-text"><span class="material-icons" style="font-size: 6rem;">check_circle</span></p>`).fadeIn(400);
                });
                $(this).text(`Berhasil menginisiasi semua jarak`).fadeIn(400);
              });
              $(".btn-prev").attr("disabled", false);
              $(".btn-next").attr("disabled", false);
            }
          },
        });
      });
      if (waiters.length == 0) {
        $(".center-wrapper p").fadeOut(400, function () {
          $(".preloader-wrapper").fadeOut(400, function () {
            $(this).remove();
            $(".center-wrapper").prepend(`<p class="green-text"><span class="material-icons" style="font-size: 6rem;">check_circle</span></p>`).fadeIn(400);
          });
          $(this).text(`Berhasil menginisiasi semua jarak`).fadeIn(400);
        });
        $(".btn-prev").attr("disabled", false);
        $(".btn-next").attr("disabled", false);
      }
    },
  },
  {
    title: "Destinasi Pertama",
    subtitle: "Pilih titik awal keberangkatan destinasi",
    get content() {
      return $("#page3").html();
    },
    onLoad() {
      const startmap = L.map("startmap").setView([-7.247886, 109.007832], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(startmap);
      const markers = [];
      pageMeta.items.forEach((item) => {
        const d = cloud.get("destinasi").data.find((x) => x.id == item);
        let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
        markers.push(new L.Marker(latlng).addTo(startmap).bindPopup(`<b>${d.nama}</b><br>${d.distrik.nama}`));
        $("select[name=id_start]").append(
          $("<option>", {
            value: item,
            text: d.nama,
            selected: item == pageMeta.start?.id,
          })
        );
      });
      if (pageMeta.start) {
        let latlng = L.latLng(parseFloat(pageMeta.start.latitude), parseFloat(pageMeta.start.longitude));
        startmap.setView(latlng, 14);
      }
      $("select[name=id_start]").on("change", function () {
        if ($(this).val()) {
          let d = cloud.get("destinasi").data.find((x) => x.id == $(this).val());
          let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
          startmap.setView(latlng, 14);
        }
      });
      $("select").formSelect();
    },
    onNext() {
      if ($("select[name=id_start]").val()) {
        pageMeta.start = $("select[name=id_start]").val();
        return true;
      }
      Toast.fire({
        icon: "error",
        title: "Pilih titik awal keberangkatan",
      });
      return false;
    },
  },
  {
    title: "Input Parameter",
    subtitle: "Input semua nilai yang dibutuhkan dalam algoritma, parameter yang diinput akan mempengaruhi keakuratan rute yang dihasilkan",
    get content() {
      return $("#page4").html();
    },
    onLoad() {
      const items = { ...localStorage };
      $.each(items, function (i, v) {
        $(`#form-param input[name=${i}]`).val(v);
      });
      M.updateTextFields();
    },
    onNext() {
      if ($("#form-param")[0].checkValidity()) {
        // get form data
        const data = {};
        $("#form-param")
          .serializeArray()
          .map(function (x) {
            data[x.name] = Number(x.value);
            localStorage.setItem(x.name, Number(x.value));
          });
        return true;
      }
      $("#form-param")[0].reportValidity();
      return false;
    },
  },
  {
    title: "Hasil",
    subtitle: "Hasil dari algoritma Ant Colony Optimization berdasarkan parameter yang telah diinput",
    get content() {
      return $("#page5").html();
    },
    onLoad() {
      resultMap = L.map("result-map").setView([-7.247886, 109.007832], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(resultMap);
      const markers = [];
      pageMeta.path.forEach((idx) => {
        const d = cloud.get("destinasi").data.find((x) => x.id == idx);
        let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
        markers.push(new L.Marker(latlng).addTo(resultMap).bindPopup(`<b>${d.nama}</b><br>${d.distrik.nama}`));
      });
      $.each({ ...localStorage }, function (i, v) {
        $(`.result-parameter #${i}`).text(v);
      });
      $(`.result-parameter #destinasi`).empty();
      $.each(pageMeta.path, function (i, v) {
        let res = $(`<li class="collection-item" data-id="${v}"></li>`);
        let d = cloud.get("destinasi").data.find((x) => x.id == v);
        v == pageMeta.start.id ? res.append(`<span>${d.nama}-${d.distrik.nama}</span><a href="#!" class="secondary-content">Awal</a>`) : res.append(`<span>${d.nama}-${d.distrik.nama}</span>`);
        $(`.result-parameter #destinasi`).append(res);
        res.on("click", function (e) {
          let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
          resultMap.setView(latlng, 14);
        });
      });
      $(".collapsible").collapsible();
      $.ajax({
        type: "POST",
        url: "/api/implementasi",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          matrix: pageMeta.matrix,
          iteration: parseInt(localStorage.getItem("aco_iteration")),
          ants: parseInt(localStorage.getItem("aco_ants")),
          evaporation: parseFloat(localStorage.getItem("aco_e")),
          alpha: parseFloat(localStorage.getItem("aco_alpha")),
          beta: parseFloat(localStorage.getItem("aco_beta")),
        }),
        success: (r) => {
          const routeInit = [];
          $(".fastest-route")
            .closest("div")
            .find(".btn")
            .on("click", function () {
              const bestRoute = r.best_route.map((x) => pageMeta.path[x]);
              polyline.remove();
              polyline = L.polyline(routeInit, { color: "#2196F3" }).addTo(resultMap);
              resultMap.fitBounds(polyline.getBounds());
            });
          $(".fastest-route").empty();
          $(".fastest-route")
            .closest("div")
            .find(".jarak span")
            .text(`${r.best_distance > 1000 ? (r.best_distance / 1000).toFixed(2) : r.best_distance} ${r.best_distance > 1000 ? "Km" : "m"}`);
          $.each(r.best_route, function (i, route) {
            if (i + 1 == r.best_route.length) {
              return;
            }
            const routeEl = $(`<li class="collection-item"></li>`);
            const d = cloud.get("destinasi").data.find((x) => x.id == pageMeta.path[route]);
            const dTo = cloud.get("destinasi").data.find((x) => x.id == pageMeta.path[r.best_route[i + 1]]);
            const step = cloud.get("rute").data.find((x) => x.id_asal == d.id && x.id_tujuan == dTo.id);
            const path = JSON.parse(step.path);
            routeInit.push(path.map((x) => [x[1], x[0]]));
            routeEl.append(
              `<div class="route"><div class="place">${d.nama}</div><div class="strip"><span class="material-icons">arrow_forward</span></div><div class="place to">${dTo.nama}</div></div><div class="distance">${
                step.jarak > 1000 ? (step.jarak / 1000).toFixed(2) : step.jarak
              } ${step.jarak > 1000 ? "Km" : "m"}</div>`
            );
            $(".fastest-route").append(routeEl);
            routeEl.on("click", function (e) {
              polyline.remove();
              polyline = L.polyline(
                path.map((x) => [x[1], x[0]]),
                { color: "#2196F3" }
              ).addTo(resultMap);
              resultMap.fitBounds(polyline.getBounds());
            });
          });
          polyline = L.polyline(routeInit, { color: "#2196F3" }).addTo(resultMap);
          resultMap.fitBounds(polyline.getBounds());
          $(".btn-next").addClass("red darken-3").fadeIn(400).html(`<i class="material-icons right">replay</i>Hitung Ulang`).on("click", this.onNext);
          const allDIagram = new Chart(document.getElementById("all-distances"), {
            type: "line",
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Diagram Jarak per Iterasi",
                },
              },
            },
            data: {
              labels: Array(r.distance_matrix.length)
                .fill(0)
                .map((x, i) => i + 1),
              datasets: [
                {
                  label: "Jarak / Iterasi",
                  data: r.distance_matrix,
                },
              ],
            },
          });
          const bestDIagram = new Chart(document.getElementById("best-distances"), {
            type: "line",
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Diagram Jarak Terbaik",
                },
              },
            },
            data: {
              labels: Array(r.best_distance_matrix.length)
                .fill(0)
                .map((x, i) => i + 1),
              datasets: [
                {
                  label: "Jarak / Iterasi",
                  data: r.best_distance_matrix,
                },
              ],
            },
          });
          $(`.result-wrapper #all-routes`).empty();
          $.each(r.routes, function (i, routes) {
            const li = $(`<li></li>`);
            const collection = $(`<ul class="collection"></ul>`);
            const cHead = $(`<div class="collapsible-header"><i class="material-icons">roundabout_right</i>Iterasi ${i + 1}</div>`);
            const cBody = $(`<div class="collapsible-body"></div>`);
            cBody.append(collection);
            li.append(cHead, cBody);
            $(`.result-wrapper #all-routes`).append(li);
            $.each(routes, function (j, route) {
              const routeWrapperEl = $(`<li class="collection-item route-wrapper" data-iteration="${i}" data-ant="${j}"></li>`);
              const routeEl = $(`<div class="route"></div>`);
              $.each(route, function (k, d) {
                routeEl.append(`<span class="green darken-3">${cloud.get("destinasi").data.find((x) => x.id == pageMeta.path[d]).nama}</span>`);
              });
              const jarak = r.distances[i][j] > 1000 ? (r.distances[i][j] / 1000).toFixed(2) : r.distances[i][j].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              const metrics = r.distances[i][j] > 1000 ? "Km" : "m";
              routeWrapperEl.append(routeEl, `<div class="distance"><span class="green darken-3">${jarak} ${metrics}</span></div>`);
              collection.append(routeWrapperEl);
              routeWrapperEl.on("click", function (e) {
                polyline.remove();
                polyline = L.polyline(routeInit, { color: "#2196F3" }).addTo(resultMap);
                resultMap.fitBounds(polyline.getBounds());
              });
            });
          });
          $(".center-wrapper").fadeOut(400, function () {
            $(this).remove();
          });
        },
      });
    },
    onPrev() {
      $(".btn-next").removeClass("red darken-3").html(`<i class="material-icons right">chevron_right</i>Berikutnya`);
      return true;
    },
    onNext() {
      pageControl.setPage(pageMeta.current());
    },
  },
];
const pageMeta = {
  current: function () {
    return parseInt(localStorage.getItem("aco_page"));
  },
  get items() {
    return new Set(JSON.parse(localStorage.getItem("aco_items")));
  },
  set items(set) {
    localStorage.setItem("aco_items", JSON.stringify(Array.from(set)));
  },
  get items3D() {
    let items = new Map();
    for (const item of pageMeta.items) {
      let temp = new Set(pageMeta.items);
      temp.delete(item);
      items.set(item, temp);
    }
    return items;
  },
  get matrix() {
    const m = Array(this.path.length)
      .fill(0)
      .map((n, i) => Array(this.path.length).fill(0));
    m.forEach((x, i) => {
      x.forEach((y, j) => {
        if (i == j) {
          m[i][j] = 0;
          return;
        }
        m[i][j] = cloud.get("rute").data.find((x) => x.id_asal == this.path[i] && x.id_tujuan == this.path[j]).jarak;
      });
    });
    return m;
  },
  get path() {
    const start = this.start.id;
    let d = this.items;
    d.delete(start);
    return [start].concat(Array.from(d));
  },
  get start() {
    return cloud.get("destinasi").data.find((x) => x.id == parseInt(localStorage.getItem("aco_start")));
  },
  set start(i) {
    localStorage.setItem("aco_start", i);
  },
};
const pageControl = {
  next: function () {
    if (pageMeta.current() < pageContent.length - 1) {
      if (pageContent[pageMeta.current()].onNext) {
        if (pageContent[pageMeta.current()].onNext() == true) this.setPage(pageMeta.current() + 1);
      } else {
        this.setPage(pageMeta.current() + 1);
      }
    }
  },
  back: function () {
    if (pageMeta.current() > 0) {
      if (pageContent[pageMeta.current()].onPrev) {
        if (pageContent[pageMeta.current()].onPrev() == true) this.setPage(pageMeta.current() - 1);
      } else {
        this.setPage(pageMeta.current() - 1);
      }
    }
  },
  setPage: function (i) {
    localStorage.setItem("aco_page", i);
    if (i == 0) {
      $(".btn-prev").fadeOut(400, function () {
        $(".btn-next").fadeIn(400);
      });
    } else if (i == pageContent.length - 1) {
      $(".btn-next").fadeOut(400, function () {
        $(".btn-prev").fadeIn(400);
      });
    } else {
      $(".btn-next").fadeIn(400);
      $(".btn-prev").fadeIn(400);
    }
    $(".implementor-wrapper .title p").fadeOut(400, function () {
      $(this).text(pageContent[i].title).fadeIn(400);
    });
    $(".implementor-wrapper .title small").fadeOut(400, function () {
      $(this).text(pageContent[i].subtitle).fadeIn(400);
    });
    $(".implementor-wrapper .content").fadeOut(400, function () {
      $(this)
        .html(pageContent[i].content ?? "")
        .fadeIn(400)
        .promise()
        .done(function () {
          if (pageContent[i].onLoad !== undefined) {
            pageContent[i].onLoad();
          }
        });
    });
    return pageContent[i];
  },
};

$("body").on("click", ".btn-next", function (e) {
  pageControl.next();
});

$("body").on("click", ".btn-prev", function (e) {
  pageControl.back();
});
$("body").on("click", ".choose-item", function (e) {
  $(this).toggleClass("active");
  let activated = true;
  $.each($(".choose-item"), function (u, e) {
    if ($(this).hasClass("active") == false) activated = false;
  });
  activated ? $(".f-button").addClass("grey") : $(".f-button").removeClass("grey");
});

$(document).ready(async function () {
  await cloud.add("/api/destinasi", {
    name: "destinasi",
  });
  await cloud.add("/api/distrik", {
    name: "distrik",
  });
  await cloud.add("/api/rute", {
    name: "rute",
  });
  cloud
    .addCallback("destinasi", function (d) {
      if (d.length > 0) {
        $(".blank-data").removeClass("hide");
        $(".implementor-wrapper").addClass("hide");
      } else {
        $(".blank-data").addClass("hide");
        $(".implementor-wrapper").removeClass("hide");
      }
    })
    .pull("destinasi");
  initStorage();
});

function initStorage() {
  if (localStorage.getItem("aco_page") === null) {
    localStorage.setItem("aco_items", "[]");
    localStorage.setItem("aco_start", "");
    localStorage.setItem("aco_page", 0);
    localStorage.setItem("aco_iteration", 0);
    localStorage.setItem("aco_ants", 0);
    localStorage.setItem("aco_e", "0.0");
    localStorage.setItem("aco_alpha", "0.0");
    localStorage.setItem("aco_beta", "0.0");
  }
  pageControl.setPage(pageMeta.current());
}
