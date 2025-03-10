const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run() {
    // TODO Make these files available on the local file system
    // You may need to update the file paths
    const files = [
      await uploadToGemini("1YiEBYWTHPiLQw5KN3M7LiK0krIY24Lgp", "application/octet-stream"),
    ];
  
    const parts = [
      {text: "What object is this? Describe how it might be used.  List three related items."},
      {text: "Object: "},
      {text: "Description: This is a pipe organ. It is a large musical instrument that is used in churches, concert halls, and other large buildings. It is made up of a series of pipes that are arranged in different sizes and shapes. The pipes are played by pressing keys on a keyboard. When a key is pressed, air is forced through the pipe, which produces a sound. The sound of a pipe organ is very powerful and can be used to create a wide variety of music."},
      {text: "Object: "},
      {text: "Description: This is a sundial. It is a device that uses the sun's position in the sky to tell the time. The sundial has a flat surface with a hole in the center. A metal rod is placed through the hole and is pointed at the North Star. The shadow of the rod falls on the flat surface and indicates the time."},
      {text: "Object: "},
      {
        fileData: {
          mimeType: files[0].mimeType,
          fileUri: files[0].uri,
        },
      },
      {text: "Description: "},
    ];
  
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });
    console.log(result.response.text());
  }
  
  run();