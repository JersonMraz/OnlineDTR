# 📊 Online DTR (Daily Time Record)

A simple and efficient **web-based attendance tracker** built using **React (TypeScript)** and **Tailwind CSS**. This application allows users to record their daily attendance, manage logs, filter records, and export data — all without a backend or database.

---

## 🚀 Features

* 🕒 **Time In / Time Out Logging**
  Easily record your daily attendance by entering your time in and time out.

* 📅 **Date-based Entries**
  Assign attendance records to specific dates.

* 🔍 **Filter & Search Records**
  Quickly filter attendance logs based on date or other criteria.

* 📁 **Export Attendance Data**
  Export records for reporting or backup (e.g., CSV format).

* 📋 **Clean UI Table**
  View all attendance records in an organized and user-friendly table.

* ⚡ **No Backend Required**
  All data is handled on the frontend (can use local storage if implemented).

---

## 🛠️ Tech Stack

* **Frontend:** React (TypeScript / TSX)
* **Styling:** Tailwind CSS
* **State Management:** React Hooks (useState, useEffect)

---

## 📸 Screenshots

> ![Online DTR Screenshot](/screenshot.png)

---

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/JersonMraz/OnlineDTR.git
```

2. Navigate to the project folder:

```bash
cd OnlineDTR
```

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open in your browser:

```
http://localhost:5173
```

---

## 📌 Usage

1. Select a date.
2. Enter your **Time In** and **Time Out**.
3. Save the record.
4. Use filters to find specific attendance logs.
5. Export your data when needed.

---

## 📂 Project Structure

```
src/
 ├── components/     # Reusable UI components
 ├── pages/          # Main pages (if applicable)
 ├── hooks/          # Custom React hooks (optional)
 ├── utils/          # Helper functions
 ├── types/          # TypeScript types/interfaces
 └── App.tsx         # Main application file
```

---

## 💾 Data Handling

Since this project does not use a backend or database:

* Data can be stored temporarily in **React state**
* Optional: Use **localStorage** to persist data on the browser

---

## 🧠 Future Improvements

* 🔐 Add authentication system
* ☁️ Integrate backend & database (e.g., API + MySQL)
* 📊 Add total hours computation and analytics
* 📱 Improve mobile responsiveness
* 🧾 Add PDF export option

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---
