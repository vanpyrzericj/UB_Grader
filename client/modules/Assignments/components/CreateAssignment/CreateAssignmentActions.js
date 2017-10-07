import callApi, {callApiWithFiles} from '../../../../util/apiCaller';



export function getCategories(assignmentsData){
	var categories = [];
    for (var i = 0; i < assignmentsData.length; ++i) {
      if (!categories.includes(assignmentsData[i].category)) {
        categories.push(assignmentsData[i].category);
      }
    }
	return categories;    
}

export function throwError(message){
	return {type:"error", error: message};
}

export function resetError(){
	return {type:"error", error:""};
}

export function submitForm(formData, course) {
  return function (dispatch) {
    dispatch(resetError());
  	var hold = undefined;
	var data;



	data = new FormData();

	//dates
	hold = validateDates(formData);
	if(hold == "skip"){
		hold = undefined;
	}else{
		
		if(hold){
			return dispatch(throwError(hold));
		}
		formData.startDate.setHours(formData.startTime.getHours(),formData.startTime.getMinutes(),0, 0);
		formData.dueDate.setHours(formData.dueTime.getHours(),formData.dueTime.getMinutes(),0, 0);
		formData.endDate.setHours(formData.endTime.getHours(),formData.endTime.getMinutes(),0, 0);

		if(formData.startDate.getTime() > formData.dueDate.getTime()){
			return dispatch(throwError("Due Date Must Come After Start"));
		}

		if(formData.dueDate.getTime() > formData.endDate.getTime()){
			return dispatch(throwError("End Date Must Come After Due"));
		}

		data.append("start_date", formData.startDate);
		data.append("due_date", formData.dueDate);
		data.append("end_date", formData.endDate);
	}

	// everything else
	hold = (!hold) ? (formData.name.replace(/[^A-Za-z0-9._~:\.\/\[\]@!$&'()*+,;=`\-_]/, '') != "") ? data.append("assignment_num", encodeURIComponent(formData.name)) : "Assignment Name Is A Required Field Or Your String Contained No Urlable Chars" : hold;
	hold = (!hold) ? (document.getElementById("tar") != null) ? data.append("tar", document.getElementById("tar").files[0], "tarball.tar") : hold : hold;
	hold = (!hold) ? (document.getElementById("make") != null) ? data.append("make", document.getElementById("make").files[0], "makefile") : hold : hold;
	hold = (!hold) ? (formData.category != "") ? data.append("category", formData.category) : "Category Is A Required Field" : hold;
	hold = (!hold) ? (formData.displayName != "") ? data.append("name", formData.displayName) : "Display Name Is A Required Field" : hold;

	data.append("section_based",false);
	data.append("auto_grader",true);

	if(!hold){
		if(formData.p_name != "" && !isNaN(parseInt(formData.max_score))){
			data.append("problems", JSON.stringify([{problem_name:formData.p_name, score : parseInt(formData.max_score) }]));
		}
		if(formData.p_name != "" && isNaN(parseInt(formData.max_score))){
			hold = "Please Enter A Vaild Number For Score";
		}
		if(formData.p_name == "" && !isNaN(parseInt(formData.max_score))){
			hold = "Plesea Enter A Vaild Name For The Problem";
		}
		if(formData.p_name == "" && isNaN(parseInt(formData.max_score)) && formData.max_score != ""){
			hold = "Plesea Enter A Vaild Name For The Problem And A Vaild Score";
		}

	}

	if(hold){
		return dispatch(throwError(hold));
	}
    return callApiWithFiles("courses/" + course + "/assignments/create", data)
      .then(data => {
      	if(data["_message"]){
        dispatch(throwError(data["_message"]));
      	}
      })
  }
}

function validateDates(formData){
	if(formData.startDate == null && formData.startTime == null && formData.dueDate == null && formData.dueTime == null && formData.endDate == null && formData.endTime == null){
		return "skip";
	}
	if(formData.startDate == null){
		return "Please Enter A Vaild Start Date";
	}
	if(formData.startTime == null){
		return "Please Enter A Vaild Start Time";
	}
	if(formData.dueDate == null){
		return "Please Enter A Vaild Due Date";
	}
	if(formData.dueTime == null){
		return "Please Enter A Vaild Due Time";
	}
	if(formData.endDate == null){
		return "Please Enter A Vaild End Date";
	}
	if(formData.endTime == null){
		return "Please Enter A Vaild End Time";
	}
	return undefined;
}