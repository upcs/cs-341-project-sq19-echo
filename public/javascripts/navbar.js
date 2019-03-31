var PAGES = ['home', 'about', 'login'];

function getNavBarHtml(curPage) {
    var navBarHtml = '<div style="margin:100px;"><nav class="navbar navbar-inverse navbar-static-top">';
    navBarHtml += '<div class="container"><a class="navbar-brand" href="/">Echo App</a><ul class="nav navbar-nav">';
    PAGES.forEach(function (page) {
        if (curPage === page) {
            navBarHtml += '<li class="active"><a href="'+page+'">'+page.toUpperCase()+'</a></li>';
        }
        else {
            navBarHtml += '<li><a href="'+page+'">'+page.toUpperCase()+'</a></li>';
        }
    });
    navBarHtml += '</ul></div></nav></div>';
    return navBarHtml;
}
