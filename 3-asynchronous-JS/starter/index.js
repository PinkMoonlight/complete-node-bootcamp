const fs = require('fs');
const superagent = require('superagent');

///////// Callback scenario (aka callback hell)
/*
fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Breed: ${data}`);

  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .end((err, res) => {
      if (err) return console.log('err.message');
      console.log(res.body.message);

      fs.writeFile('dom-img.txt', res.body.message, (err) => {
        if (err) return console.log('err.message');
        console.log('random dog image saved to file');
      });
    });
});
*/

/////// Promises
/*
fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Breed: ${data}`);

  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then((res) => {
      console.log(res.body.message);

      fs.writeFile('dom-img.txt', res.body.message, (err) => {
        if (err) return console.log('err.message');
        console.log('random dog image saved to file');
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});
*/

const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('I could not find the file 🧨');
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) reject("I can't write that file");
      resolve('File written');
    });
  });
};

// ASYNC / AWAIT - async function returns a promise automatically
const getDogPic = async () => {
  try {
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`); // saves promise to variable not the resolved value of promise

    const res2Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

    const res3Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

    const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
    const imgs = all.map(el => el.body.message);
    console.log(imgs);

    await writeFilePro('dom-img.txt', imgs.join('\n'));
    console.log('Random dog images saved to file');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return '2: READY 🦮';
};

//IIFY
(async () => {
  try {
    console.log('1: I Will get dog pics');
    //await getDogPic().then(x => console.log(x));
    const x = await getDogPic();
    console.log(x);
    console.log('3: Done getting dog pics!');
  } catch (err) {
    console.log('ERROR 🧨');
  }
})();

/*
console.log('1: I Will get dog pics');
getDogPic()
  .then(x => {
    console.log(x);
    console.log('3: Done getting dog pics!');
  })
  .catch(err => {
    console.log('ERROR 🧨');
  });
*/
/*
readFilePro(`${__dirname}/dog.txt`)
  .then(data => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then(res => {
    console.log(res.body.message);
    return writeFilePro('dom-img.txt', res.body.message);
  })
  .then(() => {
    console.log('random dog image saved to file');
  })
  .catch(err => {
    console.log(err);
  });
*/
