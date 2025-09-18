# OpenRouter Integration Setup

This document explains how to configure OpenRouter as a provider in your DeepSite application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# OpenRouter Configuration
# Get your API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site Configuration (optional, for OpenRouter attribution)
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

## Getting an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key and add it to your environment variables

## Available Models

The following models are now available through OpenRouter:

### OpenRouter-Exclusive Models
- **GPT-4o** (`openai/gpt-4o`) - OpenAI's latest flagship model
- **GPT-4o Mini** (`openai/gpt-4o-mini`) - Faster, cheaper version of GPT-4o
- **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`) - Anthropic's latest model
- **Gemini Pro 1.5** (`google/gemini-pro-1.5`) - Google's advanced model

### Existing Models (now also available via OpenRouter)
- DeepSeek V3 O324
- DeepSeek R1 0528
- Qwen3 Coder 480B A35B Instruct
- Kimi K2 Instruct
- DeepSeek V3.1
- Kimi K2 Instruct 0905

## Usage

Once configured, you can select OpenRouter as a provider in your application's model selection interface. The system will automatically route requests to OpenRouter when this provider is selected.

## Benefits of OpenRouter

1. **Unified API**: Access multiple AI providers through a single API
2. **Cost Optimization**: Automatic selection of the most cost-effective provider
3. **Fallback Support**: Automatic failover if a provider is unavailable
4. **Rate Limit Management**: Built-in rate limit handling
5. **Model Routing**: Access to models from various providers

## Troubleshooting

### "OpenRouter API key not configured" Error
- Ensure `OPENROUTER_API_KEY` is set in your environment variables
- Restart your development server after adding the environment variable

### Model Not Available
- Check that the model is available on OpenRouter at [openrouter.ai/models](https://openrouter.ai/models)
- Some models may have different names on OpenRouter vs other providers

### Rate Limiting
- OpenRouter has its own rate limits separate from individual providers
- Consider upgrading your OpenRouter plan if you hit rate limits