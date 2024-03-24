const messages = [
  {
    role: "user",
    content: `You are a helpful assistant with highly access to any information. You respond as 'Assistant'. You respond in less than 200 words.`,
  },
];

const prompts = [
  {
    prompt: `cat on space.`,
  },
];

const state = {
  engine: "@cf/meta/llama-2-7b-chat-int8",
};

document.addEventListener("DOMContentLoaded", function () {
  const target = document.getElementById("ai-content");
  fetchTextChunked(target);

  document.getElementById("engine_selector").addEventListener("change", (e) => {
    console.log(e.target);
    state["engine"] = e.target.value;
  });
  document
    .getElementById("input-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const query = formData.get("query");
      if (state["engine"] === "@cf/meta/llama-2-7b-chat-int8") {
        messages.push({
          role: "user",
          content: query,
        });
        fetchTextChunked(target);
      } else {
        prompts["prompt"] = query;
        fetchImageChunked(target);
      }
    });
});

function fetchTextChunked(target) {
  target.innerHTML = "generating text...";
  fetch("/ai", {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ messages }),
  }).then((response) => {
    const reader = response.body.getReader();
    let decoder = new TextDecoder();
    target.innerHTML = "";
    reader.read().then(function processText({ done, value }) {
      if (done) {
        messages.push({
          role: "assistant",
          content: target.innerHTML,
        });
        return;
      }
      target.innerHTML += decoder.decode(value);
      return reader.read().then(processText);
    });
  });
}

async function fetchImageChunked(target) {
  target.innerHTML = "generating image...";
  fetch('/img', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompts })
  }).then(async(response) => {
    console.log(response);

    const reader = await response.blob(); //.getReader())
    console.log(reader);
    
    const blob = URL.createObjectURL(reader);
    target.innerHTML = "";

    target.innerHTML += `<img src="${blob}"></img>`; 
    // })
  });
}
