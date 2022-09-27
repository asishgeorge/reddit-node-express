const axios = require('axios');
const constants = require('../constants')
const qs = require('qs');

let getAccessToken = async () => {
    let data = qs.stringify({
        'grant_type': 'password',
        'username': process.env.REDDIT_USERNAME,
        'password': process.env.REDDIT_PASSWORD
    });

    let url = `${constants.REDDIT_BASE_URL}/access_token`

    let auth = 'Basic ' + Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')

    let options = {
        method: 'post',
        url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth
        },
        data
    }

    try {
        let access_token_response = await axios(options);

        return access_token_response?.data
    } catch (error) {
        console.log('error', error)
        throw error
    }


}


let getThreadFromReddit = async (access_token, thread) => {
    let url =  `${constants.REDDIT_API_URL}/r/${thread}/random`

    let options = {
        method: 'get',
        url,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }

    try {
        let thread_response = await axios(options);
        return thread_response?.data
    } catch (error) {
        console.log('error', error)
        throw error
    }

} 


let formatThread = (thread_data) => {
    // title, permalink, 
    let thread_topic = thread_data[0]
    let thread_responses = thread_data[1]
    let formatted_response = []

    if(thread_topic?.data?.children.length &&  thread_topic?.data?.children[0]?.data){
        let topic_object = thread_topic?.data?.children[0]?.data;
        formatted_response.push({
            id:topic_object.id,
            body: topic_object.title,
            permalink: topic_object.permalink,
            upvote_ratio : topic_object.upvote_ratio,
            type: 'title'
        })
    }

    if(thread_responses?.data?.children.length){
        thread_responses?.data?.children.forEach(response => {
            formatted_response.push({
                id: response?.data?.id,
                body: response?.data?.body,
                permalink: response?.data?.permalink
            })
        })

    }

    return formatted_response
}



module.exports = {
    getAccessToken,
    getThreadFromReddit,
    formatThread
}