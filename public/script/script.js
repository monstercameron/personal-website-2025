// Configuration
const command = "./helloworld"; // The command to be typed
const stdoutLines = [
  { type: "stdout", text: "Hi, I'm John Doe." },
  {
    type: "stdout",
    text: "I'm a developer passionate about creating immersive experiences.",
  },
  { type: "console-warn", text: "WARNING: This is just a simulated terminal." },
  {
    type: "stdout",
    text: "I specialize in JavaScript, Python, and creating interactive UIs.",
  },
  {
    type: "console-error",
    text: "ERROR: Something went wrong! Just kidding. All systems normal.",
  },
  { type: "stdout", text: "Thanks for checking out this demo!" },
]; // Lines of stdout to display

/**
 * Simulates typing the command into the terminal.
 * @param {HTMLElement} commandElement - The element where the command is typed.
 * @param {string} command - The command to type.
 * @param {Function} callback - A callback to execute after typing is complete.
 */
function typeCommand(commandElement, command, callback) {
  let index = 0;
  const cursor = document.querySelector(".cursor");

  const interval = setInterval(() => {
    if (index < command.length) {
      commandElement.textContent += command[index];
      index++;
    } else {
      clearInterval(interval);
      cursor.remove(); // Remove the cursor after typing is complete
      if (callback) callback();
    }
  }, 100); // Typing speed in milliseconds
}

/**
 * Simulates stdout, warning, and error output one line at a time.
 * @param {HTMLElement} outputElement - The element to display output lines.
 * @param {Object[]} lines - The lines to display, with type and text.
 */
function displayOutput(outputElement, lines) {
  let lineIndex = 0;

  const interval = setInterval(() => {
    if (lineIndex < lines.length) {
      const newLine = document.createElement("p");
      const line = lines[lineIndex];

      // Apply class based on log type
      newLine.textContent = line.text;
      newLine.classList.add(line.type);

      outputElement.appendChild(newLine);
      lineIndex++;
    } else {
      clearInterval(interval); // Stop when all lines are displayed
    }
  }, 1000); // Delay between lines
}

/**
 * Initializes the terminal simulation.
 */
function initTerminal() {
  const commandElement = document.getElementById("command");
  const outputElement = document.getElementById("output");

  // Step 1: Type the command
  typeCommand(commandElement, command, () => {
    // Step 2: Display stdout, warnings, and errors after the command is typed
    displayOutput(outputElement, stdoutLines);
  });
}

// Initialize the simulation when the DOM is loaded
document.addEventListener("DOMContentLoaded", initTerminal);

/**
 * Module to manage input field behavior with API integration.
 * Hides the placeholder on focus, restores it on blur, and sends user input to an API.
 */
(function () {
  let lastPlaceholder = "type here"; // Placeholder shared across functions

  /**
   * Initialize the input field behavior.
   */
  const initializeInputField = () => {
    const inputContainer = document.getElementById("prompter");
    const inputField = inputContainer.querySelector("input");

    if (!inputField) {
      // console.error("Input field not found in the prompter container.");
      return;
    }

    // Set initial placeholder
    inputField.setAttribute("placeholder", lastPlaceholder);

    // Remove placeholder on focus
    inputField.addEventListener("focus", () => {
      // console.log("Input field focused.");
      inputField.setAttribute("placeholder", "");
      // console.log("Placeholder removed.");
    });

    // Restore placeholder on blur, always using the last placeholder
    inputField.addEventListener("blur", () => {
      // console.log("Input field blurred.");
      if (inputField.value.trim() === "") {
        // console.log("Input field is empty. Restoring placeholder.");
        inputField.setAttribute("placeholder", lastPlaceholder);
      }
    });

    // Listen for the Enter key to trigger the API call
    inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission if inside a form

        const userInput = inputField.value.trim();
        if (userInput) {
          lastPlaceholder = `Previous question: ${userInput}`; // Update last placeholder
          inputField.setAttribute("placeholder", lastPlaceholder); // Set user input as placeholder
          inputField.value = ""; // Clear the input field

          // Send GET request to /api/ask
          fetch(`/api/ask?query=${encodeURIComponent(userInput)}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.text(); // Read response as plain text
            })
            .then((data) => {
              console.log("API response:", data);
              // Append raw response to the HTML element with ID 'playground'
              const playgroundElement = document.getElementById("playground");
              if (playgroundElement) {
                const newElement = document.createElement("div"); // Create a new div element
                newElement.innerHTML = data; // Set its content
                playgroundElement.appendChild(newElement); // Append it to the playground

                // Scroll the new element into view
                newElement.scrollIntoView({ behavior: "smooth" });
              } else {
                console.error("Element with ID 'playground' not found.");
              }
            })
            .catch((error) => {
              console.error("Error during API call:", error);
            });
        }
      }
    });
  };

  // Encapsulate initialization
  initializeInputField();
})();
