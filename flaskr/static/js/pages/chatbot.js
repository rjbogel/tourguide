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

$(document).ready(function () {});
