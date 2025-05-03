import axios from "axios";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63
    }
    return languageMap[language.toUpperCase()];
}

// submits the user submissions to the judge0 api
export const submitBatch = async (submissions) => {
    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, { submissions })

    console.log("Submission results: ", data);

    return data;
}

// infinite loop till we get the desired result => id in the result is not 1 (in queue) or 2 (processing)
export const pollBatchResults = async (tokens) => {
    while (true) {
        const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: false
            }
        })

        const results = data.submissions;

        // variable becomes true if each and every result's id is neither 1 or 2
        const isAllDone = results.every((result) => result.status.id !== 1 && result.status.id !== 2);

        if (isAllDone) return results;

        await sleep(1000);
    }
}