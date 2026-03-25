exports.handler = async (event) => {
      if (event.httpMethod !== 'POST') {
              return { statusCode: 405, body: 'Method Not Allowed' };
      }
      try {
              const body = JSON.parse(event.body);
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                                    'Content-Type': 'application/json',
                                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                                    'anthropic-version': '2023-06-01',
                                    'anthropic-beta': 'messages-2023-12-15'
                        },
                        body: JSON.stringify(body)
              });
              const data = await response.json();

        // Strip markdown code fences if present
        if (data.content && data.content.length > 0) {
                  data.content = data.content.map(block => {
                              if (block.type === 'text') {
                                            block.text = block.text
                                              .replace(/^```html\s*/i, '')
                                              .replace(/^```\s*/i, '')
                                              .replace(/\s*```\s*$/i, '')
                                              .trim();
                              }
                              return block;
                  });
        }

        return {
                  statusCode: 200,
                  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                  body: JSON.stringify(data)
        };
      } catch (error) {
              return {
                        statusCode: 500,
                        body: JSON.stringify({ error: error.message || 'Something went wrong' })
              };
      }
};
