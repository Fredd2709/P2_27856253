const toIndex = (req, res, next)=> {
    res.render('index', { 
      name: 'Freddy León'
    });
  };

  module.exports = toIndex;