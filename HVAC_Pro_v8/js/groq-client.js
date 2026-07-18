/**
 * groq-client.js — Groq API Client (IIFE Pattern)
 * Provides: window.GroqClient.setAPIKey(key), window.GroqClient.sendPrompt(prompt)
 */
(function() {
  'use strict';

  let apiKey = '';

  /**
   * Public API: window.GroqClient
   */
  window.GroqClient = {
    /**
     * setAPIKey(key): Store API key and validate format
     * @param {string} key - API key from localStorage (should start with gsk_)
     */
    setAPIKey: function(key) {
      if (!key || typeof key !== 'string') {
        console.error('GroqClient: Invalid API key format');
        return;
      }

      if (!key.trim().startsWith('gsk_')) {
        console.error('GroqClient: API key must start with "gsk_"');
        return;
      }

      apiKey = key.trim();
    },

    /**
     * sendPrompt(prompt): Send prompt to Groq API and get response
     * @param {string} prompt - User question/prompt
     * @returns {Promise} - Resolves to response text or error object
     */
    sendPrompt: function(prompt) {
      return new Promise((resolve, reject) => {
        // Validate API key
        if (!apiKey || !apiKey.startsWith('gsk_')) {
          resolve({
            error: 'API key missing or invalid'
          });
          return;
        }

        // Validate prompt
        if (!prompt || typeof prompt !== 'string') {
          resolve({
            error: 'Prompt is required and must be a string'
          });
          return;
        }

        // Prepare request
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        const body = JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        });

        // Send request
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: body
        })
          .then(response => {
            // Handle HTTP errors
            if (!response.ok) {
              return response.json().then(errorData => {
                const errorMsg = errorData.error?.message || 'Unknown error';
                resolve({
                  error: `Groq API error: ${response.status} ${errorMsg}`
                });
              }).catch(() => {
                resolve({
                  error: `Groq API error: ${response.status} ${response.statusText}`
                });
              });
            }

            // Parse successful response
            return response.json().then(data => {
              try {
                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                  resolve({
                    error: 'No response content from API'
                  });
                  return;
                }
                resolve(content);
              } catch (err) {
                resolve({
                  error: 'Error parsing API response: ' + err.message
                });
              }
            });
          })
          .catch(err => {
            // Network error
            resolve({
              error: 'Network error: ' + err.message
            });
          });
      });
    }
  };

})();
