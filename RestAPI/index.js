const express = require("express");
const fs = require('fs');
const users = require("./MOCK_DATA.json");

const app = express();
const PORT = 8000;

//middlewares
app.use(express.urlencoded({ extended: false }));

//routes 
app.get("/api/users", (req, res) => { //
    return res.json(users)
})

app.get("/users", (req, res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("  ")}
    </ul>
    `;
    res.send(html);
});

app.post('/api/users', (req, res) => {
    //create new users
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        return res.json({
            status: "success", id: users.length
        });
    });
});

app.route("/api/users/:id").get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (!user) return res.status(404).json({ message: 'user not found' });
    return res.json(user);
}).patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'user not found' });
    }
    users[userIndex] = { ...users[userIndex], ...req.body }; // to merge the existing user data with the new data from req.body
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {     //to save changes to MOCK_DATA.json
        if (err) return res.status(500).json({ message: 'Error saving data' });
        return res.json({ status: "success", user: users[userIndex] });
    });
}).delete((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'user not found' });
    }

    const deletedUser = users.splice(userIndex, 1)[0]; // to remove the user from the array
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => { // which save changes to MOCK_DATA.json
        if (err) return res.status(500).json({ message: 'Error saving data' });
        return res.json({ status: "success", deleted: deletedUser });
    });
});

app.listen(PORT, () => console.log(`Server at PORT 8000`));

