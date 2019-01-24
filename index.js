//@ts-check
const Axios =  require('axios');
const fs = require('fs');
const request = require('request');
const path = require('path')
const SYSTEM_ROOT =  path.parse(process.cwd()).root
const del = require('del');
/**
 * 
 * @param {Array} stories 
 * @param {String} botId 
 */
async function train(stories,botId){
  try {
    await createTrainingData(stories, botId);
    await trainRasaServer(botId);
    
    return {
      trained:true,
      botId
    };
  } catch (error) {
    return{
      trained:false,
      error
    }
  }
  
}

function question(question, botId){

  return new Promise((resolve, reject) => {
    if (!question || !botId) {
      reject({
        message: "no question or bot id"
      });
    }
      Axios.post('http://localhost:5000/parse',{
        q:question,
        project:botId
      }).then(({data})=>{
        resolve(data.intent);
      }).catch(error=>{
        reject(error);
      })
    })
    
}
function createTrainingData(stories,botId){

  return new Promise((resolve, reject) => {
    if (!stories || !botId) {
      reject({
        message: "no stories or bot id"
      });
    }
    try {
      const stream = fs.createWriteStream(`${SYSTEM_ROOT}nlpapi-data/trainingdata/${botId}.yml`, {
        flags: "w"
      });
      //config lines
      stream.write(`language: "en"` + "\n");
      stream.write("\r");
      stream.write(`pipeline: "tensorflow_embedding"` + "\n");
      stream.write("\r");
      stream.write(`data: |` + "\n");

      stories.forEach(({value_id,expressions}) => {
        if(value_id && expressions.length > 0){
          stream.write(`  ## intent:${value_id}` + "\n");    
    
          expressions.forEach(expression => {
            stream.write(`  - ${expression.name}` + "\n");
          });
          stream.write("\r");
        }
        
      });

      stream.end(() => {
        resolve({
          status: "done",
          botId
        });
      });
    } catch (e) {
      reject({
        error: e
      });
    }
  });
}

/**
 * 
 * @param {String} botId 
 */
function trainRasaServer(botId){
  const data = fs.createReadStream(`${SYSTEM_ROOT}nlpapi-data/trainingdata/${botId}.yml`);
  return new Promise((resolve, reject) => {
    // const data = fs.createReadStream(`${SYSTEM_ROOT}nlpapi-data/trainingdata/${botId}.yml`);
    console.log(data);
    request({
    url: `http://localhost:5000/train?project=${botId}`,
    method: 'POST',
    headers: {
      'content-type' : 'application/x-yml',
    },
    // encoding: null,
    body: data
   }, (error, response, body) => {
        if (error) {
          reject({
            error
          });
        } else {
          resolve({
            status: "done",
            data:response.body.toString()
          });
        }
   });
  });
  
}
function remove(botId){
  return new Promise((resolve, reject) => {
    if (!botId) {
      reject({
        message: "no bot id"
      });
    }

    del(`${SYSTEM_ROOT}nlpapi-data/models/${botId}`,{force:true}).then(paths=>{
      resolve({msg:'deleted'})
    }).catch(error=>{
      reject(error);
    })
  })
  
  
}
module.exports = {
  train,
  question,
  remove
}