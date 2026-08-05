import Header from "../components/Header";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";

function AddArticle() {

  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");

 const handleSubmit = (e) => {
  e.preventDefault();

  console.log({
    topics,
    title,
    slug,
    status,
    content,
  });

  // Laravel API
};

const handleTitleChange = (e) => {
    const value = e.target.value;

    setTitle(value);

    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const topicList = [
  "Technology",
  "Business",
  "Health",
  "Education",
  "Sports",
  "Travel",
  "Lifestyle",
  "Finance",
];

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],

      ["bold", "italic", "underline", "strike"],

      [{ color: [] }, { background: [] }],

      [{ script: "sub" }, { script: "super" }],

      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],

      [{ align: [] }],

      ["blockquote", "code-block"],

      ["link", "image", "video"],

      ["clean"],
    ],
   
    handlers: {
      image: imageHandler,
      video: videoHandler,
    },
  },
};

const videoHandler = () => {
  const url = prompt("Enter YouTube or Video URL");

  if (!url) return;

  const quill = quillRef.current.getEditor();

  const range = quill.getSelection(true);

  quill.insertEmbed(range.index, "video", url);
};

const imageHandler = () => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files[0];

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      "http://127.0.0.1:8000/api/upload-image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    const quill = quillRef.current.getEditor();

    const range = quill.getSelection(true);

    quill.insertEmbed(range.index, "image", data.url);
  };
};



const handleTopicChange = (e) => {
  const values = Array.from(
    e.target.selectedOptions,
    (option) => option.value
  );
  setTopics(values);
};

  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.id;
  const token = localStorage.getItem("token");

  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/article/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setArticles(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const totalPosts = articles.length;
  const published = articles.filter(
    (a) => a.status === "Published"
  ).length;
  const drafts = articles.filter(
    (a) => a.status !== "Published"
  ).length;

  return (
    <>
      <Header />

      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}

        <div className="w-64 bg-white shadow-lg">

          <div className="p-6 border-b">
       
        <img
  src="http://127.0.0.1:8000/frontend/images/largeimg.jpg"
  alt={user.name}
  className="w-24 h-24 rounded-full object-cover border-4 border-white"
/>

      

            <p className="text-gray-500">
              {user.name}
            </p>

          </div>

          <ul className="mt-5">

            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/add-article"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <PlusCircle size={20} />
                Add Article
              </Link>
            </li>

            <li>
              <Link
                to="/my-articles"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <FileText size={20} />
                My Articles
              </Link>
            </li>

          </ul>

        </div>

        {/* Main */}

        <div className="flex-1 p-8">

          {/* Welcome */}

       

          {/* Stats */}

         

          {/* Recent Articles */}

       <div className="bg-white rounded-xl shadow mt-8">

        <form onSubmit={handleSubmit} className="p-8">

         {/* Topics */}
<div className="mb-6">
  <label className="block font-semibold mb-2">
    Topics
  </label>

  <select
    multiple
    value={topics}
    onChange={handleTopicChange}
    className="w-full border rounded-lg px-4 py-3 h-40 focus:ring-2 focus:ring-blue-500"
  >
    {topicList.map((topic) => (
      <option key={topic} value={topic}>
        {topic}
      </option>
    ))}
  </select>

  <p className="text-sm text-gray-500 mt-2">
    Hold Ctrl (Windows) or Cmd (Mac) to select multiple topics.
  </p>
</div>

          {/* Title */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Article Title
            </label>

            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter article title"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              readOnly
              className="w-full border rounded-lg px-4 py-3 bg-gray-100"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          {/* Content */}
          <div className="mb-8">
            <label className="block font-semibold mb-2">
              Content
            </label>

         <ReactQuill
  ref={quillRef}
  theme="snow"
  value={content}
  onChange={setContent}
  modules={modules}
  style={{ height: 400, marginBottom: 80 }}
/>
          </div>

          {/* Buttons */}
          <div className="pt-16 flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Save Article
            </button>

            <button
              type="reset"
              className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg"
            >
              Reset
            </button>
          </div>

        </form>

                 </div>

        </div>

      </div>

    </>
  );
}

export default AddArticle;