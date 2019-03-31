var PEOPLE = [
    {
        name: 'Alex Hadi',
        imageUrl: 'https://tinyurl.com/y25pe2wy',
        mainContent: 'Alex Hadi wants to teach you about angular. ' +
            'He really enjoys doing all of the sprints, and wants to become a usain bolt type sprinter.',
        emailAddress: 'hadi20@up.edu'
    },
    {
        name: 'Adam Mercer',
        imageUrl: 'https://tinyurl.com/y4tlsscn',
        mainContent: 'Is really good at finding problems... not solving them.',
        emailAddress: 'mercer20@up.edu'
    },
    {
        name: 'Pele Kamala',
        imageUrl: 'https://tinyurl.com/y2xure62',
        mainContent: 'Is very eager to work on SQL with Alex.',
        emailAddress: 'kamala21@up.edu'
    },
    {
        name: 'Callum Morham',
        imageUrl: 'https://tinyurl.com/y2k4q5uq',
        mainContent: 'Is the embodiment of larry the lobster.',
        emailAddress: 'morham20@up.edu'
    },
    {
        name: 'Chris Sebrechts',
        imageUrl: 'https://tinyurl.com/y4zuw9pr',
        mainContent: 'Does not like algorithms.',
        emailAddress: 'sebrecht20@up.edu'
    }
];

$(document).ready(function () {
    $('#navBar').html(getNavBarHtml('about'));

    var contactCardHtml = '<table><tr>';
    contactCardHtml += PEOPLE.map(function (person) {
        return '<td><div class="w3-container"><div class="w3-card-4 w3-dark-grey"><div class="w3-container w3-center">'+
            '<h3>' + person.name + '</h3>'+
            '<img src="'+person.imageUrl+'" alt="Picture of '+person.name+'" style="width: 60%;">'+
            '<h5>' + person.mainContent + '</h5>' +
            '<a href="mailto:' + person.emailAddress + ';"><button class="w3-button w3-green">Contact</button></a>' +
            '</div></div></div></td>';
    }).join('');
    contactCardHtml += '</tr></table>';
    $("#contactCards").html(contactCardHtml);
});
