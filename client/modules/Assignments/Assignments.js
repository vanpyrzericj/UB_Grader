import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//Import Actions
import { getCourseData } from './AssignmentsActions'
import {redirectReset} from './components/CreateAssignment/CreateAssignmentActions';
import RaisedButton from 'material-ui/FlatButton';

// Import Components
import Category from './modules/Category/Category';
// Import Bootstrap
import { GridList } from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';

export class Assignments extends Component {
  constructor(props) {
    super(props);
    this.state = { render: false, categories: []};
    
  }

  componentDidMount() {
    this.props.getCourseData(this.props.params.course);
    this.setState({ render: false, categories: []});
  }

  componentWillReceiveProps(nextProps) {
    this.categories = [];
    for (var i = 0; i < nextProps.assignments.length; ++i) {
      if (this.categories[nextProps.assignments[i].category] == undefined) {
        this.categories[nextProps.assignments[i].category] = [];
      }
      this.categories[nextProps.assignments[i].category].push(nextProps.assignments[i]);
    }
    this.setState({ render: true, categories: this.categories, instructor: this.state.instructor});

  }

  render() {
    var childComp = this.props.children;
    if (this.state.render && this.props.children) { return(<div>{childComp}</div>); }
    if(!this.state.render) {return null;}
    var cats = [];
    for (var key in this.state.categories) {
      cats.push(<Category key={this.state.categories[key][0].category} name={this.state.categories[key][0].category} location={this.props.location.pathname} assignments={this.state.categories[key]} />);
    }
    if(this.props.redirected){
      this.props.getCourseData(this.props.params.course);
      this.props.resetRedir();
    }
    var create = null;
    if(this.props.perms[this.props.params.course] != "student"){
      create = <RaisedButton labelStyle={{color:"white"}} backgroundColor="#005BBB" label="Create Assignment" onClick={()=>{window.location = (window.location.toString().charAt(window.location.toString().length - 1) != "/") ? window.location + "/create" : window.location.toString().substring(-1) + "create"}} />;
    } 
    
    return (
      <div>
        {create}
        <br />
        <br />
        <br />
        <GridList
          cols={3}
        >
          {cats}
        </GridList>
      </div>
    );
  }
}

// Retrieve data from store as props
function mapStateToProps(state) {
  console.log(state);
  return {
    assignments: state.assignments.assignmentsData,
    redirected: state.create.redirect,
    perms: state.app.perms,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getCourseData: getCourseData,
    resetRedir: redirectReset,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignments);

