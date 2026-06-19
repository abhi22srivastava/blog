import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentId = Number(id);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${id}`
        );

        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handlePrevious = () => {
    if (currentId > 1) {
      navigate(`/blog/${currentId - 1}`);
    }
  };

  const handleNext = () => {
    if (currentId < 100) {
      navigate(`/blog/${currentId + 1}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
    <Header/>
    <section className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        
        <Link
          to="/blog"
          className="inline-block mb-6 text-blue-600 hover:underline"
        >
          ← Back to Blogs
        </Link>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={`https://picsum.photos/1200/500?random=${blog.id}`}
            alt={blog.title}
            className="w-full h-80 object-cover"
          />

          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">
              {blog.title}
            </h1>

            <div className="text-gray-500 mb-6">
              Blog ID: {blog.id}
            </div>

            <p className="text-gray-700 leading-8">
              {blog.body}
            </p>
          </div>
        </article>

        {/* Previous / Next Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentId === 1}
            className="px-5 py-3 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            ← Previous Post
          </button>

          <button
            onClick={handleNext}
            disabled={currentId === 100}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next Post →
          </button>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
}

export default BlogDetails;