const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
//Setting up the schema
const userSchema=new mongoose.Schema({
    mail:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        select:false,
    }
})

//Hashing the password before saving
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})



//Creating the model
module.exports=mongoose.model('User',userSchema);