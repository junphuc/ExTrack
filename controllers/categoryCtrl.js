const expressAsyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

const categoryController = {
  //add
    create : expressAsyncHandler(async(req, res) =>{
      const {name, type} = req.body;
      if (!name || !type){
        throw new Error("Name and type are required for creating a category");
      };
      const normalizedName = name.toLowerCase()
      // Check if the type is invalid
      const validType = ["expense","income"];
      if (!validType.includes(type.toLowerCase())){
        throw new Error("Invalid category type" + type);
      };

      //Check if categoty already exists on the user
      const categoryExists = await Category.findOne({
        name: normalizedName,
        user: req.user,
      });
      if (categoryExists){
        throw new Error(`Category ${categoryExists.name} already exits in database`);
      };
      
      // Create category
      const category = await Category.create({
        name: normalizedName,
        user: req.user,
        type,
      });
      
      // Send the response
      res.status(201).json(category);
    }),

  //List
  list : expressAsyncHandler(async(req, res) =>{
    const categories = await Category.find({user : req.user});
    res.status(201).json(categories);
  }),

  //Update
  update : expressAsyncHandler(async(req, res) =>{const { categoryId } = req.params;
  const { type, name } = req.body;
  const normalizedName = name.toLowerCase();
  const category = await Category.findById(categoryId);
  if (!category && category.user.toString() !== req.user.toString()) {
    throw new Error("Category not found or user not authorized");
  }
  const oldName = category.name;
  //! Update category properties
  category.name = normalizedName || category.name;
  category.type = type || category.type;
  const updatedCategory = await category.save();
  //Update affected transaction
  if (oldName !== updatedCategory.name) {
    await Transaction.updateMany(
      {
        user: req.user,
        category: oldName,
      },
      { $set: { category: updatedCategory.name } }
    );
  }
  res.json(updatedCategory);}),
  //delete
  delete : expressAsyncHandler(async(req, res) =>{const category = await Category.findById(req.params.id);
    if (category && category.user.toString() === req.user.toString()) {
      //!  Update transactions that have this category
      const defaultCategory = "Uncategorized";
      await Transaction.updateMany(
        { user: req.user, category: category.name },
        { $set: { category: defaultCategory } }
      );
      //! Remove category
      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: "Category removed and transactions updated" });
    } else {
      res.json({ message: "Category not found or user not authorized" });
    }}),
};


module.exports = categoryController;
