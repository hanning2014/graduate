/**
 * Created by qian on 2016/7/12.
 */

d3.json("records.json",function(json,error) {
    if (error)return;
    myhGraph(json,"map");
});

function myhGraph(metrics,testg){
    setdata(metrics,testg);
    mu.users.initializeUser(metrics,testg);
};



