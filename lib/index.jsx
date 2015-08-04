

var uuid = require('node-uuid');
var dnd = require('react-dnd');
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var Node = require('./Node.jsx')

var ItemTypes = require('./constants.json').ItemTypes


var Container = React.createClass({

  propTypes: {
    nodes: React.PropTypes.array
  },

  getInitialState: function() {
    return {nodes:this.props.nodes}
  },
  getDefaultProps: function() {
  },

  componentWillMount : function() {},
  componentWillReceiveProps: function(nextProps) {
    this.setState({nodes:nextProps.nodes})
  },

  componentWillUnmount : function() {},

  _updateNode : function (newNode, index) {
    var nodes = this.state.nodes
    var currentNode = nodes[index]
    currentNode = newNode
    this.setState({nodes:nodes})
  },

  _updateBranch : function (newBranch) {
    var nodes = this.state.nodes
    console.log("BRNACH", newBranch)
    toplevel:
    for (var index in nodes) {
      for (var ind in nodes[index].branches) {
        if (nodes[index].branches[ind].branchId === newBranch.branchId) {
          var branch = nodes[index].branches[ind]
          break toplevel
        }
      }
    }
    console.log("Broke")
    for (var key in newBranch) {
      branch[key] = newBranch[key]
    }
    this.setState({nodes:nodes})
  },

  _collectNodeIn : function () {
    var nodes = {}
    for (var index in this.state.nodes) {
      if (this.state.nodes[index].branches) {
        for (var bindex in this.state.nodes[index].branches) {
          var branch = this.state.nodes[index].branches[bindex]
          if (branch.nodeId) {
            if (!nodes[branch.nodeId]) {
              nodes[branch.nodeId] = []
            }
            nodes[branch.nodeId].push(branch)
          }
        }
      }
    }
    return nodes
  },

  _branchUsed : function (nodeIn, branchId) {
    for (var index in nodeIn) {
      for (var bindex in nodeIn[index]) {
        if (nodeIn[index][bindex].branchId === branchId) {
          return true
        }
      }
    }
    return false
  },

  _getBranchHandles : function (nodeIn, branches) {
    var branchHandles = []
    if (branches) {
      for (var bindex in branches) {
        var branch = branches[bindex]
        if (!this._branchUsed(nodeIn, branch.branchId)) {
          branchHandles.push(branch)
        }
      }
    }
    return branchHandles
  },

  render : function() {
    var nodes = []
    var nodeIn = this._collectNodeIn()
    console.log("NODEIN", nodeIn)
    for (var index in this.state.nodes) {
      var branchesIn = []
      if (nodeIn[this.state.nodes[index].nodeId]) {
        var branchesIn = nodeIn[this.state.nodes[index].nodeId]
      }
      var branchHandles = this._getBranchHandles(nodeIn, this.state.nodes[index].branches)
      var x = (this.state.nodes[index].x) ? this.state.nodes[index].x : 0
      var y = (this.state.nodes[index].y) ? this.state.nodes[index].y : 0
      nodes.push(<Node 
                  node={this.state.nodes[index]} 
                  nodeIndex={index} 
                  branchesIn={branchesIn} 
                  branchHandles={branchHandles} 
                  BranchContents={this.props.BranchContents}
                  NodeContents={this.props.NodeContents}
                  _updateNode={this._updateNode}
                  _updateBranch={this._updateBranch}
                  x={x}
                  y={y}
                  key={"n"+index} />)
      console.log('n'+index)
    }

    var connectDropTarget = this.props.connectDropTarget;
    var isOver = this.props.isOver;

    var parentStyle = {
      width:this.props.width+"px",
      height:this.props.height+"px",
      border:'1px solid #0000FF',
      position:'relative'
    }

    var html =
    connectDropTarget(
      <div style={parentStyle}>
      {nodes}
        {isOver &&
          <div style={{
            position: 'relative',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'yellow'
          }} />
        }   
      </div>
    )
    return html
  }

})

var containerTarget = { 
  drop: function (props, monitor) {
    var item = monitor.getItem()
    var node = item.node
    var coords = monitor.getSourceClientOffset()
    node.x = coords.x
    node.y = coords.y
    item._updateNode(node)
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}



var DropContainer = dnd.DropTarget(ItemTypes.nodeContainer, containerTarget, collect)(Container);


module.exports = dnd.DragDropContext(HTML5Backend)(DropContainer);
