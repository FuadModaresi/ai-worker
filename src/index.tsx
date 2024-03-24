import { Hono } from "hono";
import { renderer } from "./renderer";
import { Ai } from "@cloudflare/ai";
import script from "../assets/script.js";
import { AiSentenceSimilarity } from "@cloudflare/ai/dist/tasks/sentence-similarity";

type Bindings = {
  AI: any;
};

type Answer = {
  response: string;
};

type ImageAnswer = {
  response: any;
  // "contentType": "image/png"
  // "format": "binary"
};

type Message = {
  content: string;
  role: string;
};

type Inputs = Array<{
  prompt: string;
}>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/script.js", (c) => {
  return c.body(script, 200, {
    "Content-Type": "text/javascript",
  });
});

app.get("*", renderer);

app.get("/", (c) => {
  return c.render(
    <>
      <h2>Ask Me</h2>
      <form id="input-form" autocomplete="off" method="post">
        <select id="engine_selector">
          <option value="@cf/meta/llama-2-7b-chat-int8">default</option>
          <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">
            advance
          </option>
        </select>
        <input
          type="text"
          name="query"
          style={{
            width: "100%",
          }}
        />
        <button type="submit">Send</button>
      </form>
      <h2>AI</h2>
      <pre
        id="ai-content"
        style={{
          "white-space": "pre-wrap",
        }}
      ></pre>
    </>
  );
});

app.post("/ai", async (c) => {
  const { messages } = await c.req.json<{ messages: Message[] }>();
  const ai = new Ai(c.env.AI);
  const answer: Answer = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
    messages,
  });

  const strings = [...answer.response];
  return c.streamText(async (stream) => {
    for (const s of strings) {
      stream.write(s);
      await stream.sleep(10);
    }
  });
});

app.post("/img", async (c) => {
  const { prompts } = await c.req.json<{ prompts: Inputs }>();
  // console.log(prompts);
  //   const inputs = {
  //     prompt: '',
  // };
  const ai = new Ai(c.env.AI);
  const answer: ImageAnswer = await ai.run(
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    prompts
  );
  console.log(answer);

  return new Response(answer, {
    headers: {
      "content-type": "image/png",
    },
  });
});

export default app;
