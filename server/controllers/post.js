import PostMessage from '../models/postMessage.js';
import mongoose from 'mongoose';

//Controllers of callback function for cleaner routes.

export const getPost = async (req, res) => {
    const { id } = req.params

    try {
        const post = await PostMessage.findById(id).lean();

        res.status(200).json(post)

    } catch (error) {
        console.error(error)
        res.status(404).json({ message: error })
    }
}


export const getPosts = async (req, res) => {
    const { page } = req.query

    try {
        const LIMIT = 2;
        const startIndex = (Number(page - 1) * LIMIT) // get the starting Index of every page
        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex).lean()

        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPage: Math.ceil(total / LIMIT) });
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//QUERY => /posts?page=1 -> page=1
export const getPostsBySearch = async (req, res) => {

    const { searchQuery, tags } = req.query

    try {
        const title = new RegExp(searchQuery, 'i') //exclude caseSensitivity
        const posts = await PostMessage.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] }) //$or OR, $in find any tags value
        console.log(posts)
        res.status(200).json({ data: posts })
    }
    catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createPost = async (req, res) => {
    const post = req.body;

    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newPost.save();

        res.status(201).json(newPost)
    } catch (error) {
        res.stats(409).json({ error: error.message })
    }
}

export const deletePost = async (req, res) => {
    const { id: _id } = req.params

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id')
    }

    await PostMessage.findByIdAndRemove(_id)

    res.json({ message: 'Post deleted successfully' })
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params
    const post = req.body
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id')
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true })

    res.json(updatedPost);
}

export const likePost = async (req, res) => {
    const { id } = req.params

    if (!req.userId) return res.json({ message: 'Unauthenticated' })

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id')
    }

    const post = await PostMessage.findById(id)

    const index = post.likes.findIndex(id => id === String(req.userId))

    if (index === -1) {
        //likes the post
        post.likes.push(req.userId)
    } else {
        //remove like
        post.likes = post.likes.filter(id => id !== String(req.userId))
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.json(updatedPost)
}

export const commentPost = async (req, res) => {
    const { id } = req.params
    const { value } = req.body

    const post = await PostMessage.findById(id)
    console.log(id)

    post.comments.push(value)

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.json(updatedPost)

}
