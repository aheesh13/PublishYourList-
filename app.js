//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app=express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-aheesh:test123@cluster0.iyvb1.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema={
  name:String
}

const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
  name:"Welcome to the todolist"
});

const item2=new Item({
  name:"Press + button to aff new items"
});

const item3=new Item({
  name:"This is the third item "
});

const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]
}

const List= mongoose.model("List", listSchema);


app.get("/", function(req,res){
  Item.find({}, function(err,found){

    if(found.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("There is an error");
        }else
        console.log("Successfully Inserted The default Items");
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", newlistitems: found});
    }

  });

});


app.get("/:usertypedname", function(req,res){
     const routename=req.params.usertypedname;
    List.findOne({name:routename},function(err,founditems){
      if(!err){
        if(!founditems){
          const list=new List({
            name: routename,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+routename);
        } else{
            res.render("list", {listTitle:founditems.name, newlistitems: founditems.items});
        }
      }
    })
  });

app.post("/", function(req,res){

 let itemName=req.body.add;
 let listname=req.body.list;

 const item = new Item({
   name: itemName
 });

 if(listname==="Today"){
   item.save();
   res.redirect("/");
 }else{
   List.findOne({name:listname}, function(err,itemsfound){
     itemsfound.items.push(item);
     itemsfound.save();
     res.redirect("/"+listname);
   })
 }


});

app.post("/delete", function(req,res){
  const checkedItemId=(req.body.checkbox);

  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });
});


let port=process.env.PORT;
if(port==null || port== ""){
  port=3000;
}

app.listen(port,function(){
  console.log("Server has started")
});
