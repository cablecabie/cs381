Library Information System 

Render URL https://cs381.onrender.com/

Group 35 
Name: 
So Cheuk Him (s12283545),
Cheng Caleb  (s13038482),
Xie Ziyang James (s12998410),
Yeung Cho Ho (s12963225)



*********************
#Login

There are total 4 users can login to the system, which consist of,
{
username: ds1 , password: 381 ;
username: ds2 , password: 381 ;
username: ds3 , password: 381 ;
username: ds4 , password: 381 ;
}

After user typed in their username and password correctly, user can access to the library information system,
however, if the typing is wrong or no such user, the box will return null and let user to enter it again.
*********************
#Logout 

User can simply click the logout button in home page to log out the account.
*********************
#Home Page 

After user logion to the system, the current time will be displayed on the screen, besides, a picture and 2 buttons named library picture and library video will be showned to users.
*********************
#CRUD Create

An user document can be created with various attributes, including:

1) User Name
2) Date (DDMMYYYY; User can choose the date using the calendar logo)
3) Borrow or Return (2 Choises only)
4) Book Type
5) Book Name
6) Telephone Number (User should input a 6 digit number)
7) Remark (...comments or anythings else)

User Name is mandatory, the others are optional.
Create operation is post request, and all information is in body of request.
*********************
#CRUD Read 

Total 2 different function to reading the information 
1) Search the document by input the username, then the system will show the result to user, if there are some user have the same username, all of them would be shown on the screen. Clicking different username can show the details of each document.
   
2) In the list function, all the user information will be shown, including how many documents in total,  user can simply click on any document and then view the details.

*********************
#CRUD Update

The user can update the library document information through the details interface.
Among the attribute shown above, User_Name cannot be changed. Since User_Name is fixed, User_Name is searching criteria for updating information. 
A library document contain the following attributes: 
1) Date (DDMMYYYY; User can choose the date using the calendar logo)
2) Borrow or Return (2 Choises only)
3) Book Type
4) Book Name
5) Telephone Number (User should input a 6 digit number)
6) Remark (...comments or anythings else)

*********************
#CRUD Delete

The user can delete the library document information  through the details interface.

*********************
#Restful
In this project, there are four HTTP request types, post, get, put and delete.

#Post 

Post request is used for CRUD create/insert.

Path URL: /api/UserName/:UserName
Test: curl -X POST -H "Content-Type: application/json" -d '{"UserName":"abc","Date":"2023-01-01","Borrow_or_Return":"Borrow","Telephone_Number":"1234567890","Remark":"Sample remark","ownerID":"123","Book_Information":{"Book_Type":"comics","Book_Name":"test"}}' localhost:3000/api/UserName/abc

#Get

Get request is used for CRUD read.

Path URL: /api/forfind/UserName/:UserName
Test: curl -X GET http://localhost:3000/api/forfind/UserName/abc

#Put 

Put request is used for CRUD update.

Path URL:/api/UserName/:UserName
Test: curl -X PUT -H "Content-Type: application/json" -d '{
    "UserName": "abc",
    "date": "2023-11-10",
    "borrow_or_return": "return",
    "phone_num": "01212331",
    "remark": "No",
    "book_type": "Fiction",
    "book_name": "NewHOME ",
    "ownerID": "jt4"
}' localhost:3000/api/UserName/abc

#Delete

Delete request is used for deletion.

Path URL: /api/fordelete/UserName/:UserName
Test: curl -X DELETE localhost:3000/api/fordelete/UserName/abc


For all restful CRUD services, login should be done at first.
curl -X POST -H "Content-Type: application/json" -d '{"UserName":"abc","Date":"2023-01-01","Borrow_or_Return":"Borrow","Telephone_Number":"1234567890","Remark":"Sample remark","ownerID":"123","Book_Information":{"Book_Type":"comics","Book_Name":"test"}}' localhost:3000/api/UserName/abc

curl -X GET http://localhost:3000/api/forfind/UserName/abc

curl -X PUT -H "Content-Type: application/json" -d '{     "UserName": "abc",     "date": "2023-11-10",     "borrow_or_return": "return",     "phone_num": "01212331",     "remark": "No",     "book_type": "Fiction",     "book_name": "NewHOME ",     "ownerID": "jt4" }' localhost:3000/api/UserName/abc

curl -X DELETE localhost:3000/api/fordelete/UserName/abc
*********************
