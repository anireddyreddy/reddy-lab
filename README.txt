REDDY LAB WEBSITE FOLDER
Department of Biology, Colorado State University

index.html          The website. Double-click to open it in any browser.
data/content.js     Most of the text of the website: covers, Science as Art
                    images, people, collaborators, publications, funding,
                    courses, honors, service, talks, news and movies.
                    Edit this file to update the site.
js/site.js          The script that draws each section from content.js.
                    No need to edit it.

Image and media folders
covers/             Journal and book covers shown on the home page.
plant-art/          Science as Art images, the three research figure panels
                    on the home page, the lab emblem and the plant photos.
people/             Portrait of the PI (add lab member photos here).
logos/              Funding agency logos.
movies/             Movie files (MP4) and their still images.
photos/             Lab photo gallery (empty; section hidden for now).
pdfs/               PDFs of papers to link from Publications (empty for now).
site_content.xlsx   Optional worksheet for collecting new content.

Sections hidden for now (content kept, can be switched back on)
  Service, News coverage and invited talks, Lab photos.

To add something, for example a new lab member:
  1. Put the photo in people/  (e.g. people/jane_doe.jpg)
  2. In data/content.js, add an entry under people, e.g.
     {"name": "Jane Doe", "title": "Ph.D. student, Biology", "project": "", "photo": "people/jane_doe.jpg"}
  3. Save, then reload index.html in the browser.

Rules that keep every link working
  1. Keep index.html and these folders together, with the same folder names.
  2. Use lowercase file names with underscores and no spaces.
  3. Do not paste OneDrive share links into the website.

To publish, copy this whole folder to the web host (CSU web server or
GitHub Pages). index.html must stay at the top level of the folder.
