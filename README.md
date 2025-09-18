---
title: DeepSite OpenRouter Fork v2
emoji: 🐳
colorFrom: blue
colorTo: blue
sdk: docker
pinned: true
app_port: 3000
license: mit
short_description: Generate any application with DeepSeek
models:
  - deepseek-ai/DeepSeek-V3-0324
  - deepseek-ai/DeepSeek-R1-0528
---

# DeepSite 🐳

DeepSite is a coding platform powered by DeepSeek AI, designed to make coding smarter and more efficient. Tailored for developers, data scientists, and AI engineers, it integrates generative AI into your coding projects to enhance creativity and productivity.

# OpenRouter Compatibility

This project has been modified so that OpenRouter can be used as a provider instead of HuggingFace. Check out the original here: https://huggingface.co/spaces/enzostvs/deepsite

## Setup

Create a file named .env.local and populate it with the following:

```bash
OPENROUTER_API_KEY=YOUR-KEY-HERE
```

Then simply run:
```
npm install
npm run build
npm start

# or
npm install
npm run dev # to run in development mode
```

That's it! Your own local website generator. All credit for the actual development goes to the original author 'enzostvs'. We just added support for OpenRouter. Enjoy!

