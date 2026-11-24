# Daymark

Daymark is a static ecommerce demo featuring a ritual quiz, a budget-aware kit builder, product comparisons, and a simulated checkout. The site runs locally without installing project dependencies or creating an account.

## Run locally

1. Clone the repository with Git.

   ```sh
   git clone https://github.com/Aastha0305/Daymark-ecom-website.git
   cd Daymark-ecom-website
   ```

   You can also choose **Code → Download ZIP** on GitHub, extract it, and open a terminal in the extracted folder.

2. With Python 3 installed, start a local server from the repository folder.

   **macOS or Linux**

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
   ```

   **Windows**

   ```powershell
   py -3 -m http.server 8000 --bind 127.0.0.1 --directory dist
   ```

3. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Keep the terminal open while using the site. Press **Ctrl+C** to stop the server.

For a quick preview without Python, open `dist/index.html` directly in a browser. Use the local server when demonstrating the saved bag and shortlist, since browser storage behavior for directly opened files can vary.

## Try the demo

Take the **Ritual Quiz**, swap an item in the **Custom Kit Builder**, and check how your budget changes. Shortlist two or three catalog items to compare them, then add a product or kit to your bag and try **Demo checkout**.

The bag and shortlist are saved in the current browser. Checkout is simulated and collects no payment or delivery information.

## Source files

- `dist/index.html` contains the page structure.
- `dist/style.css` contains the layout and styling.
- `dist/shop.js` contains the catalog, bag, and checkout behavior.
- `dist/discover.js` contains the quiz, custom kits, and comparisons.
- `dist/media/` contains the product images.
