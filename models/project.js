const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema(
	{
		title: {
			required: true,
			type: String,
		},
		imageUrl: {
			require: true,
			type: String,
		},
		description: {
			required: true,
			type: String,
		},
		category: {
			required: true,
			type: String,
		},
		area: {
			type: String,
		},
		userId: {
			required: true,
			type: Schema.Types.ObjectId,
			ref: 'User', // takes same model name
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

// const mongodb=require('mongodb');
// const getDb = require('../util/database').getDb;

// class Project {
// constructor(title,img,description,id,userId){
//     this.title=title;
//     this.img=img;
//     this.description=description;
//     this._id= id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
// }
// save(){
//     const db=getDb();
//     let dbOp;
//     if(this._id){
//         dbOp = db.collection('projects').updateOne({_id: this._id},{$set: this});
//     }
//     else{
//         dbOp=db.collection('projects').insertOne(this);
//     }
//     return dbOp
//     .then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         }
//         );
// }
// static fetchAll(){
//     const db=getDb();
//     return db.collection('projects').find().toArray()
//     .then(projects=>{
//         console.log(projects);
//         return projects
//     })
//     .catch(err=>{console.log(err);});
// }
// static findById(projId){
//     const db=getDb(); // to get access to our database
//     return db.collection('projects').find({_id: new mongodb.ObjectId(projId)})
//     .next()
//     .then(project=>{
//         console.log(project);
//         return project;
//     })
//     .catch(err=>{console.log(err);})
// }
// static deleteById(projId){
//     const db = getDb();
//     return db.collection('projects').deleteOne({_id: new mongodb.ObjectId(projId)})
//     .then(result=>{console.log('Deleted');}).catch(err=>{console.log(err)});
// }
// }

// module.exports = Project;
