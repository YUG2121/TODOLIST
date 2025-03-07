const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://yugnum1:yugyug123@yugcluster.s87k7vn.mongodb.net/todolistDB");
}

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Coding & study",
});

const item2 = new Item({
  name: "Skills & book Reading",
});

const item3 = new Item({
  name: "Gym & meditation",
});

const item4 = new Item({
  name: "revision & free time ",
});

const defaultItems = [item1, item2, item3,item4]

const ListSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", ListSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  // item.save();
  // res.redirect("/");

  if(listName === "Today"){
   item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName},function(err, Foundlist){
      Foundlist.items.push(item);
      Foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, function (err, Foundlist) {
    if (!err) {
      if (!Foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/");
      } else {
        res.render("List", {
          listTitle: Foundlist.name,
          newListItems: Foundlist.items,
        });
      }
    }
  });
});

 app.get("/work", function (req, res) {
   res.render("list", { listTitle: "Work List", newListItems: workItems });
 });

 app.get("/about", function (req, res) {
   res.render("about");
 });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
