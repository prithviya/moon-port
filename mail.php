<?php
//get data from form  

$name = $_POST['name'];
$email= $_POST['email'];
$message= $_POST['msg'];
$phone= $_POST['phone'];
$to = "geethaa14367@gmail.com";
$subject = "New message";
$txt ="Name = ". $name . "\r\n  Email = " . $email . "\r\n Message =" . $msg
"\r\n Phone Number =" . $phone;
$headers = "From: noreply@gmail.com" . "\r\n" .
"CC: somebodyelse@example.com";
if($email!=NULL){
    mail($to,$subject,$txt,$headers);
}
//redirect
header("Location:thankyou.html");
?>