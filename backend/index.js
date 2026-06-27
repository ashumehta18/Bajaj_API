const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {

    const data = req.body.data || [];

    let invalid_entries = [];
    let duplicate_edges = [];

    let edgeSet = new Set();

    let graph = {};
    let childSet = new Set();
    let parentSet = new Set();

    const regex = /^[A-Z]->[A-Z]$/;

    data.forEach(item => {

        item = item.trim();

        if (!regex.test(item)) {
            invalid_entries.push(item);
            return;
        }

        let [parent, child] = item.split("->");

        if(parent===child){
            invalid_entries.push(item);
            return;
        }

        if(edgeSet.has(item)){
            if(!duplicate_edges.includes(item))
                duplicate_edges.push(item);
            return;
        }

        edgeSet.add(item);

        if(!graph[parent])
            graph[parent]=[];

        graph[parent].push(child);

        parentSet.add(parent);
        childSet.add(child);

    });

    let roots=[];

    parentSet.forEach(node=>{
        if(!childSet.has(node))
            roots.push(node);
    });

    function build(node){
        let obj={};

        if(graph[node]){
            graph[node].forEach(c=>{
                obj[c]=build(c);
            });
        }

        return obj;
    }

    let hierarchies=[];

    roots.forEach(root=>{
        let tree={};
        tree[root]=build(root);

        hierarchies.push({
            root,
            tree,
            depth:getDepth(root)
        });
    });

    function getDepth(node){
        if(!graph[node]) return 1;

        let max=0;

        graph[node].forEach(c=>{
            max=Math.max(max,getDepth(c));
        });

        return max+1;
    }

    let largest="";

    let maxDepth=0;

    hierarchies.forEach(h=>{
        if(h.depth>maxDepth){
            maxDepth=h.depth;
            largest=h.root;
        }
    });

    res.json({

        user_id:"ASHU_120905",

        email_id:"ashu0052.be23@chitkara.edu.in",

        college_roll_number:"2310990052",

        hierarchies,

        invalid_entries,

        duplicate_edges,

        summary:{
            total_trees:hierarchies.length,
            total_cycles:0,
            largest_tree_root:largest
        }

    });

});

app.listen(3000,()=>{
    console.log("Server Started");
});