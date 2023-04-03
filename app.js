const express = require('express');
const app = express();
const port = 3000;
const Handlebars = require('handlebars');
const fs = require('fs');

const StudentVue = require('studentvue.js');

app.get('/', (req, res) => {
    StudentVue.login('YOUR_STUDENTVUE_LOGIN_PORTAL_URL', 'YOUR_STUDENTVUE_USERNAME', 'YOUR_STUDENTVUE_PASSWORD')
        .then(client => client.getGradebook())
        .then(response => {
            const jsonData = JSON.parse(response);
            const courses = jsonData.Gradebook.Courses.Course;

            // Create an HTML table with the course names and grades
            let htmlTable = '<table>';
            htmlTable += '<tr><th>Course Name</th><th>Grade</th></tr>';
            courses.forEach(course => {
                const courseName = course.Title;
                let marks = course.Marks.Mark;
                if (!Array.isArray(marks)) {
                    marks = [marks];
                }
                const grades = marks.map(mark => mark.CalculatedScoreString).join(', ');
                htmlTable += `<tr><td>${courseName}</td><td>${grades}</td></tr>`;
            });
            htmlTable += '</table>';

            // Read the template file
            fs.readFile('template.html', 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error reading template file');
                }
                // Replace the placeholder with the table HTML string
                const outputHtml = data.replace('<div id="table-placeholder"></div>', htmlTable);

                // Send the output HTML to the client
                res.send(outputHtml);
            });
        })
        .catch(error => {
            console.error(error);
            res.send('Error occurred: ' + error.message);
        });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

app.use(express.static('public'));