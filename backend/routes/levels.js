const express = require('express');
const router = express.Router();
// const { isLoggedIn, isAdmin, validateLevel, validateTopicId, noCache } = require('../middleware').default;
const { isLoggedIn, isAdmin, validateLevel, validateTopicId, noCache } = require('../middleware');
const Topic = require('../models/topics');
const Story = require('../models/stories');
const Phrase = require('../models/phrases');
const Word = require('../models/words');
const bodyParser = require('body-parser');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const mime = require('mime-types');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', isLoggedIn, (req, res) => {
  res.render('levels/levels');
});

router.get('/beginner', isLoggedIn, (req, res) => {
  res.render('levels/beginner', { level: 'beginner' });
});

router.get('/beginner/letters', isLoggedIn, (req, res) => {
  res.render('levels/letters');
});

router.get('/beginner/words', isLoggedIn, catchAsync(async (req, res) => {
  const words = await Word.find();
  res.render('levels/words', { words });
}));

router.post('/beginner/words/add', isLoggedIn, upload.single('pronunciationFile'), isAdmin, catchAsync(async (req, res) => {
  const { arabicWord, romanizations, englishTranslations, category } = req.body;
  const file = req.file;

  // Check if all required fields are filled
  if (!arabicWord.trim() || !romanizations.trim() || !englishTranslations.trim()) {
    req.flash('error', 'Please fill all the required fields.');
    return res.redirect('back');
  }


  if (!file) {
    req.flash('error', 'Please upload a file.');
    return res.redirect('back');
  }

  const existingWord = await Word.findOne({ arabic_Word: arabicWord });
  if (existingWord) {
    req.flash('error', 'The Arabic word already exists.');
    await cloudinary.uploader.destroy(file.filename);
    return res.redirect('back');
  }

  const newWord = new Word({
    category: category,
    arabic_word: arabicWord,
    romanizations: romanizations,
    english_Translations: englishTranslations,
    pronunciation_of_Words: [
      {
        uploadedFile: {
          filename: file.filename,
          url: file.path,
        },
        originalName: file.originalname
      }
    ]
  });

  // Save the new phrase to the database
  await newWord.save()
    .then(word => {
      req.flash('success', 'Word added successfully.');
      res.redirect(`/levels/beginner/words#${word._id}`);
    })
    .catch(err => {
      console.error('Error adding word:', err);
      res.render('error', { message: 'Error adding word', err: err });
    });
}));

router.put('/beginner/words/:id', isLoggedIn, upload.single('pronunciationFile'), isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { arabicWord, romanizations, englishTranslations, category } = req.body;
  const file = req.file;

  // Check if all required fields are filled and not just spaces
  if (!arabicWord.trim() || !romanizations.trim() || !englishTranslations.trim()) {
    req.flash('error', 'Please fill all the required fields.');
    return res.redirect('back');
  }

  const existingWord = await Word.findById(id);

  if (!existingWord) {
    req.flash('error', 'Word not found');
    return res.redirect('back');
  }

  // If a file is uploaded, update the attributes including the file
  if (file) {
    // Destroy the old file
    for (const pronunciation of existingWord.pronunciation_of_Words) {
      const resource_type = "video";
      const public_id = pronunciation.uploadedFile.filename;
      await cloudinary.uploader.destroy(public_id, { resource_type });
    }


    // Set the new attributes including the file
    existingWord.arabic_word = arabicWord;
    existingWord.romanizations = romanizations;
    existingWord.english_Translations = englishTranslations;
    existingWord.category = category;
    existingWord.pronunciation_of_Words = [
      {
        uploadedFile: {
          filename: file.filename,
          url: file.path,
        },
        originalName: file.originalname,
      },
    ];
  } else {
    // If no file is uploaded, update only the non-file attributes
    if (
      existingWord.arabic_word === arabicWord &&
      existingWord.romanizations === romanizations &&
      existingWord.english_Translations === englishTranslations &&
      existingWord.category === category
    ) {
      req.flash('error', 'No changes were made to the phrase.');
      return res.redirect('back');
    }

    existingWord.arabic_word = arabicWord;
    existingWord.romanizations = romanizations;
    existingWord.english_Translations = englishTranslations;
    existingWord.category = category;
  }

  await existingWord.save()
    .then(word => {
      req.flash('success', 'Word updated successfully');
      res.redirect(`/levels/beginner/words#${word._id}`);
    })
    .catch(err => {
      console.error('Error updating word:', err);
      res.render('error', { message: 'Error updating word', err: err });
    });

}));

router.delete('/beginner/words/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;

  const word = await Word.findById(id);

  if (word) {
    // Delete the pronunciation files associated with the word
    for (const pronunciation of word.pronunciation_of_Words) {
      const public_id = pronunciation.uploadedFile.filename;
      const resource_type = "video";
      await cloudinary.uploader.destroy(public_id, { resource_type });
    }


    // Delete the word from the database
    await Word.findByIdAndDelete(id);

    req.flash('success', 'Word has been deleted.');

    res.redirect(`/levels/beginner/words#${word.category}`);
  } else {
    res.render('error', { message: 'Error deleting word', err: new Error });
  }
}));


router.get('/beginner/sentences', isLoggedIn, catchAsync(async (req, res) => {
  const phrases = await Phrase.find();
  res.render('levels/sentences', { phrases });
}));

router.post('/beginner/sentences/add', isLoggedIn, upload.single('pronunciationFile'), isAdmin, catchAsync(async (req, res) => {

  const { arabicPhrase, romanizations, englishTranslations, category } = req.body;
  const file = req.file;

  // Check if all required fields are filled
  if (!arabicPhrase.trim() || !romanizations.trim() || !englishTranslations.trim()) {
    req.flash('error', 'Please fill all the required fields.');
    return res.redirect('back');
  }


  if (!file) {
    req.flash('error', 'Please upload a file.');
    return res.redirect('back');
  }

  const existingPhrase = await Phrase.findOne({ arabic_Phrase: arabicPhrase });
  if (existingPhrase) {
    req.flash('error', 'The Arabic phrase already exists.');
    await cloudinary.uploader.destroy(file.filename);
    return res.redirect('back');
  }

  const newPhrase = new Phrase({
    category: category,
    arabic_Phrase: arabicPhrase,
    romanizations: romanizations,
    english_Translations: englishTranslations,
    pronunciation_of_Phrases: [
      {
        uploadedFile: {
          filename: file.filename,
          url: file.path,
        },
        originalName: file.originalname
      }
    ]
  });

  // Save the new phrase to the database
  await newPhrase.save()
    .then(phrase => {
      req.flash('success', 'Phrase added successfully.');
      res.redirect(`/levels/beginner/sentences#${phrase._id}`);
    })
    .catch(err => {
      console.error('Error adding phrase:', err);
      res.render('error', { message: 'Error adding phrase', err: err });
    });
}));

router.put('/beginner/sentences/:id', isLoggedIn, upload.single('pronunciationFile'), isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { arabicPhrase, romanizations, englishTranslations, category } = req.body;
  const file = req.file;

  // Check if all required fields are filled and not just spaces
  if (!arabicPhrase.trim() || !romanizations.trim() || !englishTranslations.trim()) {
    req.flash('error', 'Please fill all the required fields.');
    return res.redirect('back');
  }

  const existingPhrase = await Phrase.findById(id);

  if (!existingPhrase) {
    req.flash('error', 'Phrase not found');
    return res.redirect('back');
  }

  // If a file is uploaded, update the attributes including the file
  if (file) {
    // Destroy the old file
    for (const pronunciation of existingPhrase.pronunciation_of_Phrases) {
      const resource_type = "video";
      const public_id = pronunciation.uploadedFile.filename;
      await cloudinary.uploader.destroy(public_id, { resource_type });
    }


    // Set the new attributes including the file
    existingPhrase.arabic_Phrase = arabicPhrase;
    existingPhrase.romanizations = romanizations;
    existingPhrase.english_Translations = englishTranslations;
    existingPhrase.category = category;
    existingPhrase.pronunciation_of_Phrases = [
      {
        uploadedFile: {
          filename: file.filename,
          url: file.path,
        },
        originalName: file.originalname,
      },
    ];
  } else {
    // If no file is uploaded, update only the non-file attributes
    if (
      existingPhrase.arabic_Phrase === arabicPhrase &&
      existingPhrase.romanizations === romanizations &&
      existingPhrase.english_Translations === englishTranslations &&
      existingPhrase.category === category
    ) {
      req.flash('error', 'No changes were made to the phrase.');
      return res.redirect('back');
    }

    existingPhrase.arabic_Phrase = arabicPhrase;
    existingPhrase.romanizations = romanizations;
    existingPhrase.english_Translations = englishTranslations;
    existingPhrase.category = category;
  }

  await existingPhrase.save()
    .then(phrase => {
      req.flash('success', 'Phrase updated successfully');
      res.redirect(`/levels/beginner/sentences#${phrase._id}`);
    })
    .catch(err => {
      console.error('Error updating phrase:', err);
      res.render('error', { message: 'Error updating phrase', err: err });
    });

}));

router.delete('/beginner/sentences/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;

  const phrase = await Phrase.findById(id);

  if (phrase) {
    // Delete the pronunciation files associated with the phrase
    for (const pronunciation of phrase.pronunciation_of_Phrases) {
      const public_id = pronunciation.uploadedFile.filename;
      const resource_type = "video";
      await cloudinary.uploader.destroy(public_id, { resource_type });
    }


    // Delete the phrase from the database
    await Phrase.findByIdAndDelete(id);

    req.flash('success', 'Phrase has been deleted.');

    res.redirect(`/levels/beginner/sentences#${phrase.category}`);
  } else {
    res.render('error', { message: 'Error deleting phrase', err: new Error });
  }
}));


router.get('/intermediate', isLoggedIn, (req, res) => {
  res.render('levels/intermediate', { level: 'intermediate' });
});

router.get('/:level/topics', isLoggedIn, validateLevel, noCache, catchAsync(async (req, res) => {
  const level = req.params.level;
  try {
    const topics = await Topic.find({ level });
    res.render('levels/topics', { topics, level });
  } catch (error) {
    //  console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error', err: error });
  }
}));


router.post('/:level/topics/addTopic', validateLevel, isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const level = req.params.level;
  const name = req.body.name;
  const hasName = name.trim() !== '';
  if (!hasName) {
    req.flash('error', 'Please enter a topic name.');
    return res.redirect('back');
  }
  // Check if the name already exists
  const existingTopic = await Topic.findOne({ name, level });
  if (existingTopic) {
    req.flash('error', 'A topic with the same name already exists in this level.');
    return res.redirect('back');
  }
  const newTopic = new Topic({
    name,
    description: req.body.description,
    level: level
  });
  await newTopic.save()
    .then(topic => {
      req.flash('success', 'Topic added successfully .');
      res.redirect(`/levels/${level}/topics#${topic._id}`);

    })
    .catch(err => {
      // console.log(err);
      res.render('error', { message: 'Error creating topic', err: err });
    });
}));


router.route('/:level/topics/:id/edit')
  .get(validateLevel, isLoggedIn, isAdmin, validateTopicId, noCache, catchAsync(async (req, res) => {
    const { level, id } = req.params;
    const topic = await Topic.findById(id);
    if (!topic) {
      res.redirect(`/levels/${level}/topics`);
    } else {

      res.render('editTopic', { level, topic });
    }

  }))
  .put(validateLevel, isLoggedIn, isAdmin, validateTopicId, catchAsync(async (req, res) => {
    const { level, id } = req.params;
    const { name, description } = req.body;
    const hasName = name.trim() !== '';
    if (!hasName) {
      req.flash('error', 'Please enter a topic name.');
      return res.redirect('back');
    }
    // Check if the name already exists
    const existingTopic = await Topic.findOne({ name, level });
    if (existingTopic) {
      req.flash('error', 'Cannot rename it with existing topic in this level.');
      return res.redirect('back');
    }

    const updatedTopic = await Topic.findByIdAndUpdate(id, { name, description }, { new: true });

    if (!updatedTopic) {
      req.flash('error', 'Topic not found');
      return res.redirect(`/levels/${level}/topics`);
    }

    req.flash('success', 'Topic updated successfully');
    res.redirect(`/levels/${level}/topics#${updatedTopic._id}`);
  }));
router.delete('/:level/topics/:id/delete', isLoggedIn, validateLevel, validateTopicId, isAdmin, async (req, res) => {
  const { level, id } = req.params;

  try {
    // Find the topic to be deleted
    const topic = await Topic.findById(id);

    // Delete all materials from Cloudinary
    const materials = topic.materials;
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const filename = material.uploadedFile.filename;
      const resourceType = material.resource_type;
      await cloudinary.uploader.destroy(filename, { resource_type: resourceType });
    }

    // Delete the topic
    await Topic.findByIdAndDelete(id);
    req.flash('success', 'Topic has been deleted ');
    res.redirect(`/levels/${level}/topics`);
  } catch (err) {
    req.flash('error', err);
    res.redirect(`/levels/${level}/topics/${id}/edit`);
  }
});


router.post('/:level/topics/postLink/:id', validateLevel, isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;
  const topic = await Topic.findById(id);
  const level = req.params.level;
  const title = req.body.title;
  const linkUrl = req.body.linkUrl;
  const hasTitle = title.trim() !== '';
  const hasLink = linkUrl.trim() !== '';
  if (!hasTitle || !hasLink) {
    req.flash('error', 'Please fill the required inputs.');
    return res.redirect('back');
  }
  const link = {
    linkUrl,
    title
  };
  topic.links.push(link);
  await topic.save();

  const newLinkId = topic.links[topic.links.length - 1]._id; // Get the ID of the newly added link

  req.flash('success', 'Link posted successfully');
  res.redirect(`/levels/${level}/topics#${newLinkId}`);

}));

router.delete('/:level/topics/links/:id', validateLevel, isLoggedIn, isAdmin, validateTopicId, catchAsync(async (req, res) => {
  const { level, id } = req.params;

  const topic = await Topic.findOneAndUpdate(
    { links: { $elemMatch: { _id: id } } },
    { $pull: { links: { _id: id } } },
    { new: true }

  );
  req.flash('success', 'Link has been deleted.');
  res.redirect(`/levels/${level}/topics#${topic._id}`);
}));

router.post('/:level/topics/addMaterial/:id', validateLevel, isLoggedIn, isAdmin, validateTopicId, upload.single('file'), catchAsync(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findById(id);

  const level = req.params.level;

  const file = req.file;
  if (!file) {
    req.flash('error', 'Please upload a file.');
    return res.redirect('back');
  }

  const fileTypeResult = mime.lookup(file.originalname);

  const title = req.body.title;
  const hasTitle = title.trim() !== '';
  if (!hasTitle) {
    req.flash('error', 'Please fill the required inputs.');
    return res.redirect('back');
  }
  if (!req.file) {
    req.flash('error', 'Please upload a file.');
    return res.redirect('back');
  }


  const material = {
    title,
    uploadedFile: {
      filename: file.filename,
      url: file.path,
    },
    resource_type: fileTypeResult.startsWith('image/') ? 'image' : fileTypeResult.startsWith('video/') ? 'video' : 'raw',
    originalName: req.file.originalname,
    icon: getIcon(fileTypeResult)
  };
  topic.materials.push(material);
  await topic.save();

  const newMaterialId = topic.materials[topic.materials.length - 1]._id; // Get the ID of the newly added material

  req.flash('success', `${title} uploaded successfully.`);
  res.redirect(`/levels/${level}/topics#${newMaterialId}`);
}));


function getIcon(fileTypeResult) {
  const mimeType = fileTypeResult;
  if (!mimeType) {
    return 'fa-file';
  }
  switch (mimeType) {
    case 'application/pdf':
      return 'fa-file-pdf text-danger';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'fa-file-word text-primary-emphasis';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'fa-file-excel text-success';
    case 'text/plain':
      return 'fa-file-alt';
    case 'image/jpeg':
    case 'image/png':
      return 'fa-file-image text-info';
    case 'audio/mpeg':
      return 'fa-file-audio';
    case 'video/mp4':
      return 'fa-file-video text-danger-emphasis';
    default:
      return 'fa-file';
  }
}

router.delete('/:level/topics/materials/:id', validateLevel, validateTopicId, isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const { level, id } = req.params;
  const topic = await Topic.findOne({ 'materials._id': id });
  const material = topic.materials.find(material => material.id === id);

  if (material) {
    const filename = material.uploadedFile.filename;
    const title = material.title;
    let resourceType = material.resource_type;
    const fileTypeResult = mime.lookup(material.originalName);

    if (fileTypeResult === 'application/pdf') {
      // Set resource type to 'image' for PDF files
      resourceType = 'image';
    }

    req.flash('success', `${title} has been deleted.`);
    await cloudinary.uploader.destroy(filename, { resource_type: resourceType });

    await Topic.findOneAndUpdate(
      { materials: { $elemMatch: { _id: id } } },
      { $pull: { materials: { _id: id } } },
      { new: true }
    );

    res.redirect(`/levels/${level}/topics#${topic._id}`);
  } else {
    res.render('error', { message: 'Error deleting material', err: new Error });
  }
}));


router.get('/advanced', isLoggedIn, (req, res) => {
  res.render('levels/advanced', { level: 'advanced' });
});

router.get('/advanced/stories', isLoggedIn, catchAsync(async (req, res) => {
  const stories = await Story.find()
  res.render('levels/stories', { stories: stories });
}));


router.post('/advanced/stories/add', isLoggedIn, isAdmin, upload.single('story'), catchAsync(async (req, res) => {
  const file = req.file;

  const fileTypeResult = mime.lookup(file.originalname);

  if (!file) {
    req.flash('error', 'Please upload a file.');
    return res.redirect('back');
  }

  if (!fileTypeResult.startsWith('video/')) {
    req.flash('error', 'File type must be a video.');
    await cloudinary.uploader.destroy(file.filename);
    return res.redirect('back');
  } else {
    const story = new Story({
      uploadedFile: {
        filename: file.filename,
        url: file.path.replace('/upload/', '/upload/so_1/'),
      },
      originalName: file.originalname,
    });
    await story.save();
    req.flash('success', 'Story uploaded successfully.');
    res.redirect('/levels/advanced/stories');
  }

}));


router.delete('/advanced/stories/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id);

  if (story) {
    const public_id = story.uploadedFile.filename;
    const resource_type = "video";

    req.flash('success', `Story has been deleted.`);
    await cloudinary.uploader.destroy(public_id, { resource_type });

    await Story.findByIdAndDelete(id);

    res.redirect("/levels/advanced/stories");
  } else {
    res.render('error', { message: 'Error deleting story', err: new Error });
  }
}));


module.exports = router;
