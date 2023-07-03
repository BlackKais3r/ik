let url;
let wrapper = document.querySelector('.img-wrapper');
let entry = document.getElementById('img-entry');
let text = document.getElementById('text-entry');
let copy_button;
let dl_button;
text.addEventListener("keyup", () => {      //input listener
    if (!text.value) {
        wrapper.classList.remove('active');
    }
});






function newQR() {


    if (!text.value) return;
    let html = '';
    url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text.value}`;

    html += `
        <img id="qr-img" src = ${url}>
        <div class="img-wrapper-flow">
            <button id="dl-btn" class="img-btn">Download &#11015;</button>
            <button id="copy-btn" class="img-btn">Copy to clipboard &#128279;</button>
        </div>
    `;
    try{
        entry.setHTML(html);
    } catch (err) {
        const tempElement = document.createElement('div');
        const sanitizedOutput = sanitizeFunctionOutput(html);
        tempElement.innerHTML = sanitizedOutput;
        while (tempElement.firstChild) {
            entry.appendChild(tempElement.firstChild);
        }
    }
    wrapper.classList.add('active');
    dl_button = document.getElementById('dl-btn');
    dl_button.addEventListener('click', async () => {
        try {
            downloadImage(url)
            dl_button.setHTML('Downloaded &#10004;');
        } catch (err) {
            dl_button.setHTML('Downlaod Failed &#10006;');
            console.log(err.name, err.message);
        }
    })



    copy_button = document.getElementById('copy-btn');
    copy_button.addEventListener('click', async () => {
        const responsePromise = fetch(url);
        try {
            if ('write' in navigator.clipboard) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': new Promise(async (resolve) => {
                            const blob = await responsePromise.then(response => response.blob());
                            resolve(blob);
                        }),
                    }),
                ]);
                // Image copied as image.
            } else {
                const text = await responsePromise.then(response => response.text());
                await navigator.clipboard.writeText(text);
                // Image copied as source code.
            }
            //transform button here
            copy_button.setHTML('Copied &#10004;');
        } catch (err) {
            copy_button.setHTML('Copy Failed &#10006;');
            console.error(err.name, err.message);
        }
    });


function sanitizeFunctionOutput(output) {
  // Sanitize the URL
  const url = encodeURIComponent(output.url);

  // Validate and sanitize the HTML
  const validHTMLRegex = /^[a-zA-Z0-9-]+$/; // Define a regex for valid HTML tags and attributes
  const sanitizedOutput = output
    .replace(/</g, "&lt;") // Replace opening angle brackets with HTML entity
    .replace(/>/g, "&gt;") // Replace closing angle brackets with HTML entity
    .replace(/(\s)src(\s)*=(\s)*\${url}/g, `$1src=$2"${url}"`); // Sanitize the src attribute

  // Validate and sanitize the HTML tags and attributes
  const sanitizedOutputWithValidTags = sanitizedOutput.replace(/<[a-zA-Z0-9-]+/g, tag => {
    const tagName = tag.substring(1); // Remove the opening angle bracket from the tag
    if (tagName.match(validHTMLRegex)) {
      return tag; // Return the tag if it matches the valid HTML regex
    } else {
      return "&lt;"; // Replace the tag with HTML entity if it doesn't match the regex
    }
  });

  return sanitizedOutputWithValidTags;
}


}

function writeToCanvas(src) {
    return new Promise((res) => {
        const canvas = decodeURI.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = src;

        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                res(blob);
            }, 'image/png');
        }
    });
}

async function downloadImage(imageSrc) {
    let nameOfDownload = 'qr.png';
    const response = await fetch(imageSrc);

    const blobImage = await response.blob();

    const href = URL.createObjectURL(blobImage);

    const anchorElement = document.createElement('a');
    anchorElement.href = href;
    anchorElement.download = nameOfDownload;

    document.body.appendChild(anchorElement);
    anchorElement.click();

    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
}
