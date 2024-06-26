M.AutoInit();
$(".datepicker").datepicker({
  format: "dd/mm/yyyy",
  i18n: {
    months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"],
    weekdays: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"],
    weekdaysShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    weekdaysAbbrev: ["M", "S", "S", "R", "K", "J", "S"],
  },
  defaultDate: new Date("2000-01-10"),
});
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const capEachWord = (a) => {
  return a
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.findInternal = function (a, b, c) {
  a instanceof String && (a = String(a));
  for (var e = a.length, d = 0; d < e; d++) {
    var f = a[d];
    if (b.call(c, f, d, a)) return { i: d, v: f };
  }
  return { i: -1, v: void 0 };
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a;
      };
$jscomp.getGlobal = function (a) {
  a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) return c;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (a, b) {
  var c = $jscomp.propertyToPolyfillSymbol[b];
  if (null == c) return a[b];
  c = a[c];
  return void 0 !== c ? c : a[b];
};
$jscomp.polyfill = function (a, b, c, e) {
  b && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(a, b, c, e) : $jscomp.polyfillUnisolated(a, b, c, e));
};
$jscomp.polyfillUnisolated = function (a, b, c, e) {
  c = $jscomp.global;
  a = a.split(".");
  for (e = 0; e < a.length - 1; e++) {
    var d = a[e];
    if (!(d in c)) return;
    c = c[d];
  }
  a = a[a.length - 1];
  e = c[a];
  b = b(e);
  b != e && null != b && $jscomp.defineProperty(c, a, { configurable: !0, writable: !0, value: b });
};
$jscomp.polyfillIsolated = function (a, b, c, e) {
  var d = a.split(".");
  a = 1 === d.length;
  e = d[0];
  e = !a && e in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var f = 0; f < d.length - 1; f++) {
    var l = d[f];
    if (!(l in e)) return;
    e = e[l];
  }
  d = d[d.length - 1];
  c = $jscomp.IS_SYMBOL_NATIVE && "es6" === c ? e[d] : null;
  b = b(c);
  null != b &&
    (a
      ? $jscomp.defineProperty($jscomp.polyfills, d, { configurable: !0, writable: !0, value: b })
      : b !== c &&
        (($jscomp.propertyToPolyfillSymbol[d] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(d) : $jscomp.POLYFILL_PREFIX + d),
        (d = $jscomp.propertyToPolyfillSymbol[d]),
        $jscomp.defineProperty(e, d, { configurable: !0, writable: !0, value: b })));
};
$jscomp.polyfill(
  "Array.prototype.find",
  function (a) {
    return a
      ? a
      : function (b, c) {
          return $jscomp.findInternal(this, b, c).v;
        };
  },
  "es6",
  "es3"
);
(function (a) {
  "function" === typeof define && define.amd
    ? define(["jquery", "datatables.net"], function (b) {
        return a(b, window, document);
      })
    : "object" === typeof exports
    ? (module.exports = function (b, c) {
        b || (b = window);
        (c && c.fn.dataTable) || (c = require("datatables.net")(b, c).$);
        return a(c, b, b.document);
      })
    : a(jQuery, window, document);
})(function (a, b, c, e) {
  var d = a.fn.dataTable;
  a.extend(!0, d.defaults, {
    dom: "<'row'<'col s12 m6'l><'col s12 m6'f>><'row'<'col s12'tr>><'row'<'col s12 m12'i><'col s12 m12 center'p>>",
    renderer: "materializecss",
  });
  a.extend(d.ext.classes, { sWrapper: "dataTables_wrapper", sFilterInput: "", sLengthSelect: "", sProcessing: "dataTables_processing", sPageButton: "" });
  d.ext.renderer.pageButton.materializecss = function (f, l, A, B, m, t) {
    var u = new d.Api(f),
      C = f.oClasses,
      n = f.oLanguage.oPaginate,
      D = f.oLanguage.oAria.paginate || {},
      h,
      k,
      v = 0,
      y = function (q, w) {
        var x,
          E = function (p) {
            p.preventDefault();
            a(p.currentTarget).hasClass("disabled") || u.page() == p.data.action || u.page(p.data.action).draw("page");
          };
        var r = 0;
        for (x = w.length; r < x; r++) {
          var g = w[r];
          if (Array.isArray(g)) y(q, g);
          else {
            k = h = "";
            switch (g) {
              case "ellipsis":
                h = "&#x2026;";
                k = "disabled";
                break;
              case "first":
                h = n.sFirst;
                k = g + (0 < m ? "" : " disabled");
                break;
              case "previous":
                h = n.sPrevious;
                k = g + (0 < m ? "" : " disabled");
                break;
              case "next":
                h = n.sNext;
                k = g + (m < t - 1 ? "" : " disabled");
                break;
              case "last":
                h = n.sLast;
                k = g + (m < t - 1 ? "" : " disabled");
                break;
              default:
                (h = g + 1), (k = m === g ? "active" : "");
            }
            if (h) {
              var F = a("<li>", { class: C.sPageButton + " " + k, id: 0 === A && "string" === typeof g ? f.sTableId + "_" + g : null })
                .append(a("<a>", { href: "#", "aria-controls": f.sTableId, "aria-label": D[g], "data-dt-idx": v, tabindex: f.iTabIndex, class: "" }).html(h))
                .appendTo(q);
              f.oApi._fnBindAction(F, { action: g }, E);
              v++;
            }
          }
        }
      };
    try {
      var z = a(l).find(c.activeElement).data("dt-idx");
    } catch (q) {}
    y(a(l).empty().html('<ul class="pagination"/>').children("ul"), B);
    z !== e &&
      a(l)
        .find("[data-dt-idx=" + z + "]")
        .trigger("focus");
  };
  return d;
});

$.ajaxSetup({
  headers: {
    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
  },
});

$("body").on("click", ".paper-trigger", function (e) {
  e.preventDefault();
  $(`#${$(this).attr("target")}`).addClass("active");
});
$("body").on("click", ".paper-folder", function (e) {
  e.preventDefault();
  $(`.paper-fold`).removeClass("active");
});

$(document).ready(function () {
  $(".datatables-init").DataTable();
  $("select").formSelect();
});

$("#logout-button").on("click", function (e) {
  e.preventDefault();
  Swal.fire({
    title: "Keluar",
    text: "Apakah anda yakin akan keluar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Keluar",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      $(location).prop("href", $(this).attr("href"));
    }
  });
});

async function getWilayah(q = null) {
  return $.ajax({
    type: "GET",
    url: baseUrl + "/api/wilayah",
    data: q ? { q: q } : {},
    success: function (response) {
      return response;
    },
  });
}

const changeProvinsi = function (event) {
  $(`select[name=kota]`).empty().append($(`<option value="" disabled selected>Pilih Kabupaten/Kota</option>`)).closest(".input-field").addClass("hide");
  $(`select[name=kecamatan]`).empty().closest(".input-field").addClass("hide");
  $(`select[name=desa]`).empty().closest(".input-field").addClass("hide");
  M.FormSelect.getInstance($(`select[name=kota]`)).destroy();
  getWilayah($(this).val()).then((items) => {
    $.each(items, function (i, item) {
      $("select[name=kota]").append(
        $("<option>", {
          value: item.kode,
          text: item.nama,
        })
      );
    });
    $(`select[name=kota]`).closest(".input-field").removeClass("hide");
    $("select[name=kota]").formSelect();
  });
};
const changeKota = function (event) {
  $(`select[name=kecamatan]`).empty().append($(`<option value="" disabled selected>Pilih Kecamatan</option>`)).closest(".input-field").addClass("hide");
  $(`select[name=desa]`).empty().closest(".input-field").addClass("hide");
  M.FormSelect.getInstance($(`select[name=kecamatan]`)).destroy();
  getWilayah($(this).val()).then((items) => {
    $.each(items, function (i, item) {
      $("select[name=kecamatan]").append(
        $("<option>", {
          value: item.kode,
          text: item.nama,
        })
      );
    });
    $(`select[name=kecamatan]`).closest(".input-field").removeClass("hide");
    $("select[name=kecamatan]").formSelect();
  });
};
const changeDesa = function (event) {
  $(`select[name=desa]`).empty().append($(`<option value="" disabled selected>Pilih Desa</option>`)).closest(".input-field").addClass("hide");
  M.FormSelect.getInstance($(`select[name=desa]`)).destroy();
  getWilayah($(this).val()).then((items) => {
    $.each(items, function (i, item) {
      $("select[name=desa]").append(
        $("<option>", {
          value: item.kode,
          text: item.nama,
        })
      );
    });
    $(`select[name=desa]`).closest(".input-field").removeClass("hide");
    $("select[name=desa]").formSelect();
  });
};

const setDaerah = async function (...daerah) {
  d = ["provinsi", "kota", "kecamatan", "desa"];
  for (let i = 0; i < daerah.length; i++) {
    $("body").off("change", `select[name=${d[i]}]`);
    $(`select[name=${d[i]}]`).closest(".input-field").removeClass("hide");
    $(`select[name=${d[i]}]`).empty();
    $(`select[name=${d[i]}]`).formSelect();
    await getWilayah(i == 0 ? null : daerah[i - 1]).then((items) => {
      $.each(items, function (idx, item) {
        $(`select[name=${d[i]}]`).append(
          $("<option>", {
            selected: item.kode == daerah[i] ? true : false,
            value: item.kode,
            text: item.nama,
          })
        );
      });
      $(`select[name=${d[i]}]`).formSelect();
    });
  }
  if (daerah.length < 4) {
    $("body").off("change", `select[name=${d[daerah.length]}]`);
    $(`select[name=${d[daerah.length]}]`).closest(".input-field").removeClass("hide");
    $(`select[name=${d[daerah.length]}]`)
      .empty()
      .append($(`<option value="" disabled selected>Pilih ${d[daerah.length]}</option>`));
    await getWilayah(daerah[daerah.length - 1]).then((items) => {
      $.each(items, function (idx, item) {
        $(`select[name=${d[daerah.length]}]`).append(
          $("<option>", {
            selected: item.kode == daerah[daerah.length] ? true : false,
            value: item.kode,
            text: item.nama,
          })
        );
      });
      $(`select[name=${d[daerah.length]}]`).formSelect();
    });
  }
  initDaerahFun();
  console.log(daerah);
};

function initDaerahFun() {
  $("body").on("change", "select[name=provinsi]", changeProvinsi);

  $("body").on("change", "select[name=kota]", changeKota);

  $("body").on("change", "select[name=kecamatan]", changeDesa);
}

const initProvinsi = function () {
  $(`select[name=provinsi]`).empty().append($(`<option value="" disabled selected>Pilih Provinsi</option>`)).closest(".input-field").addClass("hide");
  $(`select[name=kota]`).empty().closest(".input-field").addClass("hide");
  $(`select[name=kecamatan]`).empty().closest(".input-field").addClass("hide");
  $(`select[name=desa]`).empty().closest(".input-field").addClass("hide");
  M.FormSelect.getInstance($(`select[name=provinsi]`)).destroy();
  getWilayah().then((items) => {
    $.each(items, function (i, item) {
      $("select[name=provinsi]").append(
        $("<option>", {
          value: item.kode,
          text: item.nama,
        })
      );
    });
    $(`select[name=provinsi]`).closest(".input-field").removeClass("hide");
    $("select[name=provinsi]").formSelect();
  });
};

class WisataPicker {
  settings = {};
  constructor(options) {
    $.extend(
      this.settings,
      {
        dataset: [],
        el: null,
        parent: null,
        mode: "asal",
        blacklist: [],
      },
      options
    );
    this.render();
    this.settings.el.on("keyup", "input[name=wisata_query]", (e) => {
      this.render(e.target.value);
    });
  }

  set onclick(fn) {
    this.settings.el.on("click", ".wisata-item", fn);
  }

  get(attr) {
    return this.settings[attr] ?? null;
  }

  render(q = null) {
    let data = q ? this.settings.dataset.filter((d) => d.nama.toLowerCase().includes(q.toLowerCase()) || d.distrik.nama.toLowerCase().includes(q.toLowerCase())) : this.settings.dataset;
    this.settings.blacklist.map((b) => (data = data.filter((d) => d.id != b)));
    this.settings.el.find(".wisata-picker").html(data.map((d) => `<div class="wisata-item" data-id="${d.id}"><p class="wisata-name">${d.nama}</p><p class="wisata-distrik">${d.distrik.nama}</p></div>`).join(""));
  }

  reset() {
    this.settings.el.find("input[name=wisata_query]").val("");
    this.render();
  }
}

$("body").on("click", ".sub-content:not(.deletable)", function (e) {
  const target = $(this).data("target");
  $(`.content-section-sub[data-section=${target}]`).addClass("open");
});

$(document).ready(function () {
  if ($(`select[name=provinsi]`).length) {
    initProvinsi();
  }

  initDaerahFun();
});
