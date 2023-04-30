const mongoose = require("mongoose");
const axios = require("axios");

const blogSchema = {
  id: String,
  slug: String,
  created: String,
  updated: String,
  title: String,
  body: String,
  views: String,
  tags: [String],
  bodyHTML: String,
  authorDescription: String,
};

const blogModel = mongoose.model("Blogs", blogSchema);

const decryptBody = async (body) => {
  const data = JSON.stringify({
    raw_body: body,
  });
  const config = {
    method: "post",
    url: "https://write.as/api/markdown",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };

  const decryptedData = await axios(config);
  return decryptedData.data;
};

const decryptBlogs = async (data) => {
  let dataArray = [];
  for (let i = 0; i < data.length; i++) {
    const res = await decryptBody(data[i].body);
    dataArray = [...dataArray, res];
  }
  return dataArray;
};

const saveBlogsToDb = async (data) => {
  let savedPosts = [];
  const postToSave = [...data].map((el) => {
    return {
      id: el?.id,
      slug: el?.slug,
      created: el?.created,
      updated: el?.updated,
      title: el?.title,
      body: el?.body,
      views: el?.views,
      tags: el?.tags,
      bodyHTML: el?.bodyHTML,
      authorDescription: el?.collection?.description,
    };
  });

  for (let i = 0; i < postToSave.length; i++) {
    const savePost = new blogModel({
      id: postToSave[i]?.id,
      slug: postToSave[i]?.slug,
      created: postToSave[i]?.created,
      updated: postToSave[i]?.updated,
      title: postToSave[i]?.title,
      body: postToSave[i]?.body,
      views: postToSave[i]?.views,
      tags: postToSave[i]?.tags,
      bodyHTML: postToSave[i]?.bodyHTML,
      authorDescription: postToSave[i]?.collection?.description,
    });
    let savedData = await savePost.save();
    savedPosts = [...savedPosts, savedData];
  }
  return savedPosts;
};

const savePostToDb = async (blogs) => {
  const unPublishedBlogs = blogs;
  const decryptedPosts = await decryptBlogs(unPublishedBlogs);
  const blogsTosave = unPublishedBlogs.map((el, idx) => {
    return { ...el, bodyHTML: decryptedPosts[idx].data.body };
  });

  try {
    const saveDataToDb = await saveBlogsToDb(blogsTosave);
    console.log("Blog saved successfully");
  } catch (err) {
    console.log("Something went wrong in publishing data");
  }
};

const getBlogsFromDb = async () => {
  const blogsFromDb = await blogModel.find({});
  return [...blogsFromDb];
};

const getBlogs = async (accessToken) => {
  console.log(accessToken, "inside get getBlogs");
  const getPostConfig = {
    method: "get",
    url: "https://write.as/api/me/posts",
    headers: {
      Authorization: `Token ${accessToken}`,
      "Content-Type": "application/json",
    },
  };
  try {
    const allPost = await axios(getPostConfig);
    const data = [...allPost.data.data];
    const blogsFromDb = await getBlogsFromDb();
    let unPublishedBlogs = [];
    console.log(blogsFromDb.length, "ash:: blogsFromDb.length");
    console.log(data.length, "ash:: data.length");
    if (blogsFromDb.length !== data.length) {
      const totalUnPublishedBlogs = data.length - blogsFromDb.length;
      unPublishedBlogs = data.filter(
        (el) => !blogsFromDb.find((a) => el.id === a.id)
      );
      savePostToDb(unPublishedBlogs);
    } else {
      console.info("You have no blogs to publish");
    }
  } catch (err) {
    console.log(err, "Error in getBlogs catch failed to get posts");
  }
};

const publishBlog = async () => {
  console.log("login called");
  const data = JSON.stringify({
    alias: process.env.USER,
    pass: process.env.PASSWORD,
  });

  const authConfig = {
    method: "post",
    url: "https://write.as/api/auth/login",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios(authConfig);
    const accessToken = response.data.data.access_token;
    console.log("login passed");
    if (accessToken) {
      console.log("accessToken present");
      getBlogs(accessToken);
    } else {
      console.log("accessToken not present");
    }
  } catch (err) {
    console.log(err, "ash: error logging in");
  }
};

module.exports = { publishBlog };
