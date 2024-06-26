let wp;

const map = L.map("map").setView([-7.247886, 109.007832], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
const icons = {
  human: L.divIcon({
    html: `<i class="material-icons teal-text" style="font-size: 2.5rem">directions_walk</i>`,
  }),
};
const markers = {};
let polyline;

let markerAsal = new L.Marker(L.latLng(parseFloat(-7.281941040730421), parseFloat(109.02496664419398)), { icon: icons.human, draggable: true }).bindPopup(`<b>Titik Awal</b>`);
markerAsal.on("drag", function (e) {
  $("input[name=latitude]").val(e.target.getLatLng().lat);
  $("input[name=longitude]").val(e.target.getLatLng().lng);
});
map.on("click", function (e) {
  markerAsal.slideTo(L.latLng(e.latlng.lat, e.latlng.lng), { duration: 150 });
  $("input[name=latitude]").val(e.latlng.lat);
  $("input[name=longitude]").val(e.latlng.lng);
});
const onInput = function () {
  if ($("input[name=latitude]").val() && $("input[name=longitude]").val()) {
    markerAsal.slideTo(L.latLng(parseFloat($("input[name=latitude]").val()), parseFloat($("input[name=longitude]").val())), { duration: 150 });
  }
};

const onSetDestination = function (tujuan) {
  if ($("input[name=latitude]").val() && $("input[name=longitude]").val()) {
    const lat = parseFloat($("input[name=latitude]").val());
    const lng = parseFloat($("input[name=longitude]").val());
    $.ajax({
      url: baseOSRM + `${lng},${lat};${tujuan.lng},${tujuan.lat}`,
      type: "GET",
      data: {
        geometries: "geojson",
        overview: "full",
      },
      success: async function (osrm) {
        if (osrm.code == "Ok") {
          const path = osrm.routes[0].geometry.coordinates;
          if (polyline) {
            map.removeLayer(polyline);
          }
          polyline = L.polyline(path.map((x) => [x[1], x[0]]), { color: "#2196F3" }).addTo(map);
          map.fitBounds(polyline.getBounds());
        }
      },
    });
  }
};

$("input[name=latitude]").on("keyup", onInput);
$("input[name=longitude]").on("keyup", onInput);

markerAsal.addTo(map);

$("body").on("click", "#btn-back", function () {
  $(".navigator-wrapper").removeClass("close");
});

$("select[name=wisata_id]").on("change", function () {
  const id = $(this).val();
  map.panTo(markers[id].getLatLng());
  markers[id].openPopup();

  onSetDestination(markers[id].getLatLng());
});

$(document).ready(function () {
  $("#btn-search").addClass("disabled");
  cloud
    .add("/api/destinasi", {
      name: "destinasi",
      callback: function (d) {
        wp.settings.dataset = d.data;
      },
    })
    .then(function (d) {
      d.data.forEach((destinasi) => {
        let latlng = L.latLng(parseFloat(destinasi.latitude), parseFloat(destinasi.longitude));
        markers[destinasi.id] = new L.Marker(latlng).bindPopup(`<b>${destinasi.nama}</b><br>${destinasi.distrik.nama}`);

        markers[destinasi.id].addTo(map);

        markers[destinasi.id].on("click", function (o) {
          const data = destinasi;
          $("select[name=wisata_id]").val(data.id_distrik).formSelect();

          onSetDestination(markers[destinasi.id].getLatLng());
        });

        $("#wisata_id").append(`<option value="${destinasi.id}">${destinasi.nama}</option>`);
        $("select").formSelect();
      });
    });
  cloud
    .add("/api/rute", {
      name: "rute",
      callback: function (r) {},
    })
    .then(function (d) {
      $(".wisata-loader").fadeOut("fast", function (e) {
        $(this).remove();
        $(".wisata-selecter").fadeIn();
      });
    });
});
