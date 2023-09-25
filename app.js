const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use("/img", express.static("img"));
// Configure EJS as the view engine
app.set('view engine', 'ejs');

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Define the main route
app.get('/', (req, res) => {
    // Render the 'index' view with empty iterations and no root initially
    res.render('index', { iterations: [], root: null });
});

// Define the route for calculating the root using Bisection method
app.post('/calculate-bisection', (req, res) => {
    // Get user inputs
    const { expression, a, b, tolerance } = req.body;
    
    // Calculate iterations and the root using the Bisection method
    const iterations = bisectionMethod(parseFloat(a), parseFloat(b), parseFloat(tolerance), expression);
    const root = iterations.length > 0 ? iterations[iterations.length - 1].x : null;
    console.log('Root:', root);
    console.log('Rendering view with root:', root);
    // Render the 'index' view with the calculated iterations and root
    res.render('index', { iterations, root, a, b });
});

const math = require('mathjs');

// Function to perform the Bisection method
function bisectionMethod(a, b, tolerance, expression) {
    const iterations = [];
    let x;
    let iteration = 0;

    if (evaluateExpression(expression, a) * evaluateExpression(expression, b) >= 0) {
        throw new Error("Bisection method requires that f(a) and f(b) have opposite signs.");
    }

    do {
        // Calculate the midpoint c
        x = (a + b) / 2;
        const fx = evaluateExpression(expression, x);

        // Push the iteration details to the 'iterations' array
        iterations.push({
            iteration: iteration + 1,
            a: a.toFixed(4),
            b: b.toFixed(4),
            fa: evaluateExpression(expression, a).toFixed(4),
            fb: evaluateExpression(expression, b).toFixed(4),
            x: x.toFixed(4),
            fx: fx.toFixed(4),
        });

        if (fx === 0 || (b - a) / 2 < tolerance) {
            break;
        }

        // Update a or b based on the sign of fc
        if (evaluateExpression(expression, a) * fx < 0) {
            b = x;
        } else {
            a = x;
        }

        iteration++;
    } while (iteration < 100);

    return iterations;
}

// Function to evaluate a mathematical expression with a given value
function evaluateExpression(expression, x) {
    try {
        const scope = { x };
        const compiledExpression = math.compile(expression);
        const result = compiledExpression.evaluate(scope);
        return result;
    } catch (error) {
        throw new Error("Invalid expression: " + error.message);
    }
}

// Start the Express server on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
