//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-jik:jiik1996@cluster0.ekc7g.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema= {
  name:String
}

const Item = mongoose.model('Item', itemSchema);

const item = new Item({ name: 'EatFood' });
const item1 = new Item({ name: 'wolk in the park' });
const item2 = new Item({ name: 'smile on the morning' });
allitems=[item, item1,item2];

const listSchema={
  name:String,
  items:[itemSchema]
}

const List= mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  const day = date.getDate();
  if(allitems.length===0){
    const allitems=[item,item1,item2];
    Item.insertMany(allitems,function (err) {
        console.log("Succesfully added!");
    });
      res.redirect("/");
  }
else{
  Item.find({},function(err,items){
  res.render("list", {listTitle: day, newListItems: items});
  });
}

});
app.get("/:costumListName", function(req,res){
  const listName=_.capitalize(req.params.costumListName);
  List.findOne({name:listName},function (err , foundList) {
      if(!err){
        if(!foundList){
          const lists= new List({
            name:listName,
            items:allitems
          });
            lists.save();
            res.redirect("/"+listName);
        }
      else{
  res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
      }
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName=req.body.list;
    const itemTemplate = new Item({ name: item});
  if(listName===date.getDate()){
    itemTemplate.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function (err, foundList) {
      foundList.items.push(itemTemplate);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete" , function (req,res) {
  const a= req.body.name;
  console.log(a);
  if(req.body.name===date.getDate()){
    Item.findOneAndRemove( req.body.checkbox ,function (err) {
      if(!err){
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:req.body.name},{$pull:{items:{_id:req.body.checkbox}}},function(err, listFound){
          if (!err) {
            console.log("adedd secec");
            res.redirect("/"+req.body.name);
          }
          });
    }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
