const tables = {
  destinasi: $("#table-destinasi").DataTable({
    order: [[1, "asc"]],
    responsive: true,
    ajax: {
      url: "/api/destinasi",
      dataSrc: "data",
    },
    columns: [
      { data: "distrik.nama" },
      { data: "nama" },
      {
        data: "id",
        width: "15%",
        render: function (data, type) {
          if (type === "display") {
            return `<div class="center"><a class="waves-effect waves-light btn-small btn-edit btn-floating yellow darken-3 paper-trigger" target="paper1" data-id="${data}" data-context="destinasi"><i
            class="material-icons">edit</i></a> <a class="waves-effect waves-light btn-small btn-floating btn-delete red" data-id="${data}" data-context="destinasi"><i
            class="material-icons">delete</i></a></div>`;
          }

          return data;
        },
      },
    ],
  }),
  distrik: $("#table-distrik").DataTable({
    order: [[0, "asc"]],
    responsive: true,
    ajax: {
      url: "/api/distrik",
      dataSrc: "data",
    },
    columns: [
      { data: "nama" },
      {
        data: "id",
        render: function (data, type) {
          if (type === "display") {
            return `<div class="center"><a class="waves-effect waves-light btn-small btn-edit btn-floating yellow darken-3" data-id="${data}" data-context="distrik"><i
            class="material-icons">edit</i></a> <a class="waves-effect waves-light btn-small btn-floating btn-delete red" data-id="${data}" data-context="distrik"><i
            class="material-icons">delete</i></a></div>`;
          }

          return data;
        },
      },
    ],
  }),
};

const datasets = {
  destinasi: [],
  distrik: [],
};

const pull = {
  destinasi: function () {
    return $.ajax({
      url: "/api/destinasi",
      type: "GET",
      success: function (res) {
        datasets.destinasi = res.data;
      },
    });
  },
  distrik: function () {
    return $.ajax({
      url: "/api/distrik",
      type: "GET",
      success: function (res) {
        datasets.distrik = res.data;
      },
    });
  },
  all: async function () {
    await this.destinasi();
    await this.distrik();
  },
};

const selects = {
  distrik: {
    el: $("select[name=id_distrik]"),
    fill: function (data) {
      $("#form-destinasi select[name=id_distrik]").html("");
      $("#form-destinasi select[name=id_distrik]").append(
        $("<option>", {
          value: "",
          text: "Pilih Distrik",
          disabled: true,
          selected: true,
        })
      );
      $.each(data ?? datasets.distrik, function (i, item) {
        $("#form-destinasi select[name=id_distrik]").append(
          $("<option>", {
            value: item.id,
            text: item.nama,
          })
        );
      });
      $("#form-destinasi select[name=id_distrik]").formSelect();
    },
  },
  fillByDataset: async function () {
    selects.distrik.fill(datasets.distrik);
  },
};

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
});
const osmHOT = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France",
});
const maps = {
  minimapDestinasi: L.map("minimap-destinasi").setView([-7.247886, 109.007832], 14),
  minimapDistrik: L.map("minimap-distrik").setView([-7.247886, 109.007832], 14),
  supermap: L.map("supermap", {
    center: [-7.247886, 109.007832],
    zoom: 14,
    layers: [osm],
  }),
};

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(maps.minimapDestinasi);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(maps.minimapDistrik);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(maps.supermap);

const markers = {
  destinasi: [],
  distrik: [],
  super: {},
};

let spots = {};

async function init() {
  await pull.all();
  await selects.fillByDataset();
}

$(document).ready(function () {
  init();
});

$("body").on("click", ".paper-trigger[target='paper1']", async function (e) {
  if (markers.destinasi.length > 0) {
    $.each(markers.destinasi, function (i, v) {
      maps.minimapDestinasi.removeLayer(v);
    });
    markers.destinasi = [];
  }
  $("#form-destinasi")[0].reset();
  await pull.all();
  await selects.fillByDataset();

  if ($(this).hasClass("btn-add")) {
    $("#form-destinasi").attr("action", "/api/destinasi");
    $("#paper1 .title").text("Tambah Destinasi");
  } else {
    let d = datasets.destinasi.filter((d) => d.id == $(this).data("id"))[0];
    $("#form-destinasi").attr("action", "/api/destinasi/" + d.id);
    ["nama", "deskripsi", "latitude", "longitude"].map((v) => {
      $(`#form-destinasi input[name=${v}],#form-destinasi textarea[name=${v}]`).val(d[v]);
    });
    $("select[name=id_distrik]").val(d.id_distrik).formSelect();
    if (markers.destinasi.length > 0) {
      $.each(markers.destinasi, function (i, v) {
        maps.minimapDestinasi.removeLayer(v);
      });
      markers.destinasi = [];
    }
    let ll = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
    markers.destinasi.push(new L.Marker(ll).addTo(maps.minimapDestinasi));
    maps.minimapDestinasi.setView(ll, 13);
    M.updateTextFields();
    $("#paper1 .title").text("Edit Destinasi");
  }
});

function resetDistrik() {
  $("#form-distrik").attr("action", "/api/distrik");
  if (markers.distrik.length > 0) {
    $.each(markers.distrik, function (i, v) {
      maps.minimapDistrik.removeLayer(v);
    });
    markers.distrik = [];
  }
  $("#form-distrik")[0].reset();
}
$("body").on("click", ".paper-trigger[target='paper2']", resetDistrik);

$("body").on("submit", "#form-destinasi", function (e) {
  e.preventDefault();
  if (!$("select[name=id_distrik]").val()) {
    Toast.fire({
      icon: "error",
      title: "Pilih distrik terlebih dahulu",
    });
    return false;
  }

  let data = $(this).serialize();
  $.ajax({
    url: $(this).attr("action"),
    type: "POST",
    data: data,
    success: function (res) {
      Toast.fire({
        icon: res.toast.icon,
        title: res.toast.title,
      });
      $("#paper1").removeClass("active");
      pull.destinasi();
      tables.destinasi.ajax.reload();
    },
  });
});
$("body").on("submit", "#form-distrik", function (e) {
  e.preventDefault();
  let data = $(this).serialize();
  $.ajax({
    url: $(this).attr("action"),
    type: "POST",
    data: data,
    success: function (res) {
      Toast.fire({
        icon: res.toast.icon,
        title: res.toast.title,
      });
      resetDistrik();
      pull.distrik();
      tables.distrik.ajax.reload();
    },
  });
});
$("body").on("change", "#form-destinasi select[name=id_distrik]", function (e) {
  if ($(this).val()) {
    let d = datasets.distrik.filter((d) => d.id == $("#form-destinasi select[name=id_distrik]").val())[0];
    let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
    maps.minimapDestinasi.setView(latlng, 12);
  }
});

$("body").on("click", ".btn-delete", function (e) {
  Swal.fire({
    title: "Hapus",
    text: "Apakah anda yakin akan menghapus data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `/api/${$(this).data("context")}/${$(this).data("id")}`,
        type: "DELETE",
        success: (res) => {
          Toast.fire({
            icon: res.toast.icon,
            title: res.toast.title,
          });
          pull[$(this).data("context")]();
          tables[$(this).data("context")].ajax.reload();
        },
      });
    }
  });
});

$("body").on("click", "#paper2 .btn-edit", function (e) {
  let d = datasets.distrik.filter((d) => d.id == $(this).data("id"))[0];
  if (markers.distrik.length > 0) {
    $.each(markers.distrik, function (i, v) {
      maps.minimapDistrik.removeLayer(v);
    });
    markers.distrik = [];
  }
  let latlng = L.latLng(parseFloat(d.latitude), parseFloat(d.longitude));
  markers.distrik.push(new L.Marker(latlng).addTo(maps.minimapDistrik));
  $("#form-distrik").attr("action", "/api/distrik/" + d.id);
  $("#form-distrik input[name=distrik_nama]").val(d.nama);
  $("#form-distrik input[name=distrik_latitude]").val(d.latitude);
  $("#form-distrik input[name=distrik_longitude]").val(d.longitude);
  maps.minimapDistrik.setView(latlng, 12);
  M.updateTextFields();
});

maps.minimapDestinasi.on("click", function (e) {
  if (markers.destinasi.length > 0) {
    $.each(markers.destinasi, function (i, v) {
      maps.minimapDestinasi.removeLayer(v);
    });
    markers.destinasi = [];
  }
  markers.destinasi.push(new L.Marker(e.latlng).addTo(maps.minimapDestinasi));
  $("#form-destinasi input[name=latitude]").val(e.latlng.lat);
  $("#form-destinasi input[name=longitude]").val(e.latlng.lng);
  M.updateTextFields();
});

maps.minimapDistrik.on("click", function (e) {
  if (markers.distrik.length > 0) {
    $.each(markers.distrik, function (i, v) {
      maps.minimapDistrik.removeLayer(v);
    });
    markers.distrik = [];
  }
  markers.distrik.push(new L.Marker(e.latlng).addTo(maps.minimapDistrik));
  $("#form-distrik input[name=distrik_latitude]").val(e.latlng.lat);
  $("#form-distrik input[name=distrik_longitude]").val(e.latlng.lng);
  M.updateTextFields();
});

let baseMaps = {
  OpenStreetMap: osm,
  "OpenStreetMap.HOT": osmHOT,
};
let layerControl = L.control.layers(baseMaps).addTo(maps.supermap);

$("body").on("click", ".btn-map", function () {
  if (spots != {}) {
    $.each(spots, function (i, v) {
      layerControl.removeLayer(v);
    });
    spots = {};
  }
  if (markers.super != {}) {
    $.each(markers.distrik, function (i, v) {
      $.each(v, function (id, vd) {
        maps.minimapDistrik.removeLayer(vd);
      });
    });
    markers.super = {};
  }
  $.each(datasets.destinasi, function (i, d) {
    if (!markers.super[d.distrik.nama]) {
      markers.super[d.distrik.nama] = [];
    }
    let coor = new L.Marker(L.latLng(parseFloat(d.latitude), parseFloat(d.longitude)));
    markers.super[d.distrik.nama].push(coor.bindPopup(d.nama));
  });
  $.each(markers.super, function (i, d) {
    spots[i] = L.layerGroup(d);
  });
  $.each(spots, function (i, d) {
    layerControl.addOverlay(d, i);
  });
  maps.supermap.setView([-7.247886, 109.007832], 11);
});

$("body").on("click", ".btn-map-close", function () {
  $.each(layerControl._layers, function (i, l) {
    if (i >= Object.keys(baseMaps).length) {
      maps.supermap.removeLayer(l.layer);
    }
  });
});
