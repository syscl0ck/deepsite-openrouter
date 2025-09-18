// Test script for OpenRouter integration
// This file can be used to test the OpenRouter client independently

import { createOpenRouterClient } from './openrouter-client';

export async function testOpenRouterConnection(apiKey: string) {
  try {
    const client = createOpenRouterClient(apiKey, {
      httpReferer: 'https://deepsite.test',
      xTitle: 'DeepSite Test',
    });

    console.log('Testing OpenRouter connection...');
    
    // Test getting available models
    const models = await client.getModels();
    console.log(`Found ${models.length} available models`);
    
    // Test a simple chat completion
    const response = await client.chatCompletion({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "OpenRouter integration working!" if you can see this message.',
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log('Response:', response.choices[0]?.message?.content);
    console.log('✅ OpenRouter integration test successful!');
    
    return { success: true, response };
  } catch (error) {
    console.error('❌ OpenRouter integration test failed:', error);
    return { success: false, error };
  }
}

// Example usage (uncomment to test):
// testOpenRouterConnection(process.env.OPENROUTER_API_KEY || '');