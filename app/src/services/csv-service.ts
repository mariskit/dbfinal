/**
 * Fetches the content of a CSV file from a given URL.
 */
export async function fetchCsvContent(csvUrl: string): Promise<string> {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      // Try to get more specific error message from response if possible
      let errorText = `HTTP error! status: ${response.status}`;
      try {
        const responseBody = await response.text();
        // Check if response is JSON with an error message
        const jsonError = JSON.parse(responseBody);
        if (jsonError && jsonError.message) {
          errorText = `${errorText} - ${jsonError.message}`;
        } else if(responseBody.length < 200) { // Avoid logging large HTML error pages
          errorText = `${errorText} - ${responseBody}`;
        }
      } catch (e) {
        // Response body was not JSON or text, or another error occurred
      }
      throw new Error(errorText);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Failed to fetch CSV content:", error);
    if (error instanceof Error) {
      // Prepend a user-friendly message if it's not already a detailed one
      if (!error.message.toLowerCase().includes('failed to fetch') && !error.message.toLowerCase().includes('http error')) {
        throw new Error(`Failed to fetch CSV: ${error.message}`);
      }
      throw error; // rethrow original error if it's already descriptive
    }
    throw new Error("An unknown error occurred while fetching CSV content.");
  }
}
