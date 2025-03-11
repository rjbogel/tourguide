const chatWrapper = $(".chat-wrapper");

function getAnswer(query) {
  const preload = $(`<p style="display: none">Mengetik ....</p>`);
  chatWrapper.append(preload);
  preload.fadeIn("normal", () => {
    chatWrapper[0].scrollTop = chatWrapper[0].scrollHeight;
  });
  $.ajax({
    type: "POST",
    url: origin + "/api/chatting",
    data: JSON.stringify({
      query: query,
    }),
    dataType: "json",
    contentType: "application/json",
    success: function (response) {
      preload.fadeOut("normal", () => {
        const answerEl = $(chatBot(response.answer));
        chatWrapper.append(answerEl);
        answerEl.find("map").each(function (e) {
          const id = $(this).data("id");
          const lokasi = cloud.get("lokasi").find((l) => l.id == id);
          let elLokasi = $(`
<div class="mapouter">
  <div class="gmap_canvas"><iframe width="725" height="300" id="gmap_canvas"
      src="https://maps.google.com/maps?q=${lokasi.coor}&t=&z=18&ie=UTF8&iwloc=&output=embed" frameborder="0"
      scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://www.analarmclock.com"></a><br><a href="https://www.alarm-clock.net"></a><br><a href="https://www.ongooglemaps.com">adding google map to website</a>
  </div>
</div>
          `);
          answerEl.append(elLokasi);
        });
        answerEl.fadeIn("normal", () => {
          chatWrapper[0].scrollTop = chatWrapper[0].scrollHeight;
        });
      });
    },
  });
}

const chatBot = function (msg) {
  return `
    <div class="chatbox chat-bot" style="display: none">
      <span class="chat-user">Bot</span>
      <p>${msg}</p>
    </div>`;
};
const chatGuest = function (msg) {
  return `
    <div class="chatbox chat-self" style="display: none">
      <span class="chat-user">Guest</span>
      <p>${msg}</p>
    </div>`;
};
const loader = function (msg) {
  return `
    <div class="chatbox chat-self" style="display: none">
      <span class="chat-user">Guest</span>
      <p>${msg}</p>
    </div>`;
};

$("#input-text").on("keyup", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    $(".input-button").trigger("click");
  }
});
$(".input-button").on("click", function (e) {
  const text = $("#input-text").val();
  const questionEl = $(chatGuest(text));
  chatWrapper.append(questionEl);
  questionEl.fadeIn("normal", () => {
    $("#input-text").val("");
    M.textareaAutoResize($("#input-text"));
    chatWrapper[0].scrollTop = chatWrapper[0].scrollHeight;
    getAnswer(text);
  });
});

$(document).ready(function () {
  cloud.add(origin + "/api/lokasi", {
    name: "lokasi",
  });
});
