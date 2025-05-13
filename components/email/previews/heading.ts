// components/previews/heading.ts
export const headingPreviewHtml = `
  <!-- the dark skeleton panel (fills the 2:1 frame) -->
  <div
    class="relative flex flex-col items-center justify-center
           w-2/5 h-full gap-3
           bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           px-4 py-6 rounded-md shadow-sm"
  >
    <!-- four high‑contrast bars -->
    <div class="h-2 w-11/12 rounded-sm bg-slate-400"></div>
    <div class="h-2 w-3/4    rounded-sm bg-slate-400"></div>
    <div class="h-2 w-2/3    rounded-sm bg-slate-400"></div>
    <div class="h-2 w-1/2    rounded-sm bg-slate-400"></div>
  </div>
`;

export const headingIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32">
  <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.25"/>
  </filter></defs>
  <rect x="12" y="8"  width="40" height="16" rx="8" fill="#25AEBA" filter="url(#shadow)"/>
  <rect x="16" y="14" width="32" height="4"  rx="2" fill="rgba(0,0,0,0.3)"/>
  <g transform="translate(38 12) scale(1.3) rotate(-20)" filter="url(#shadow)">
    <path d="M4.037 4.688 a.495.495 0 0 1 .651-.651 l16 6.5 a.5.5 0 0 1-.063.947 l-6.124 1.58 a2 2 0 0 0-1.438 1.435 l-1.579 6.126 a.5.5 0 0 1-.947.063 z" fill="#fff"/>
  </g>
</svg>
`;

export const headingSnippetHtml = `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <title></title>
  
    <style type="text/css">
      
      @media only screen and (min-width: 620px) {
        .u-row {
          width: 600px !important;
        }

        .u-row .u-col {
          vertical-align: top;
        }

        
            .u-row .u-col-100 {
              width: 600px !important;
            }
          
      }

      @media only screen and (max-width: 620px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        .u-row {
          width: 100% !important;
        }

        .u-row .u-col {
          display: block !important;
          width: 100% !important;
          min-width: 320px !important;
          max-width: 100% !important;
        }

        .u-row .u-col > div {
          margin: 0 auto;
        }


        .u-row .u-col img {
          max-width: 100% !important;
        }

}
    
body{margin:0;padding:0}table,td,tr{border-collapse:collapse;vertical-align:top}.ie-container table,.mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit!important;text-decoration:none!important}


@media (max-width: 480px) {
            .hide-mobile {
              
              max-height: 0px;
              overflow: hidden;
    
              display: none !important;
            }
          }
          

table, td { color: #000000; } @media (max-width: 480px) { #u_content_heading_1 .v-container-padding-padding { padding: 5px 10px 20px !important; } #u_content_heading_1 .v-text-align { text-align: center !important; } #u_content_menu_2 .v-padding { padding: 0px 9px !important; } #u_content_image_2 .v-container-padding-padding { padding: 40px 10px 0px !important; } #u_content_image_2 .v-src-width { width: auto !important; } #u_content_image_2 .v-src-max-width { max-width: 100% !important; } #u_content_text_1 .v-container-padding-padding { padding: 10px !important; } #u_content_button_1 .v-size-width { width: 65% !important; } #u_content_button_1 .v-container-padding-padding { padding: 10px 10px 40px !important; } #u_content_social_1 .v-container-padding-padding { padding: 40px 10px 10px !important; } #u_content_text_3 .v-container-padding-padding { padding: 10px 10px 20px !important; } }
    </style>
  
  

<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table role="presentation" id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
    
  
  
    <!--[if gte mso 9]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 600px;">
        <tr>
          <td background="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" valign="top" width="100%">
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
        <v:fill type="frame" src="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
  
<div class="u-row-container" style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: center top;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
  
<table id="u_content_heading_1" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:20px 0px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
    <h1 class="v-text-align" style="margin: 0px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word; font-size: 22px; font-weight: 400;"><span>[Your Logo]</span></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  
    <!--[if gte mso 9]>
      </v:textbox></v:rect>
    </td>
    </tr>
    </table>
    <![endif]-->
    


  
  
    <!--[if gte mso 9]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 600px;">
        <tr>
          <td background="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" valign="top" width="100%">
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
        <v:fill type="frame" src="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
  
<div class="u-row-container" style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: center top;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="598" style="width: 598px;padding: 0px;border-top: 1px solid #000000;border-left: 1px solid #000000;border-right: 1px solid #000000;border-bottom: 1px solid #000000;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 1px solid #000000;border-left: 1px solid #000000;border-right: 1px solid #000000;border-bottom: 1px solid #000000;"><!--<![endif]-->
  
<table id="u_content_menu_2" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Raleway',sans-serif;" align="left">
        
<div class="menu" style="text-align:center;">
<!--[if (mso)|(IE)]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr><![endif]-->

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding">Home
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding">Page
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding">About Us
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  
    <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
    <span style="padding:10px 20px;display:inline-block;color:#000000;font-family:'Montserrat',sans-serif;font-size:14px;" class="v-padding hide-mobile">
      |
    </span>
    <!--[if (mso)|(IE)]></td><![endif]-->
  

  <!--[if (mso)|(IE)]><td style="padding:10px 20px"><![endif]-->
  
    <a href="https://www.unlayer.com" target="_self" style="padding: 10px 20px; display: inline-block; color: rgb(0, 0, 0); font-family: &quot;Montserrat&quot;, sans-serif; font-size: 14px; text-decoration: none; line-height: inherit;" class="v-padding">Contact Us
    </a>
  
  <!--[if (mso)|(IE)]></td><![endif]-->
  

<!--[if (mso)|(IE)]></tr></table><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  
    <!--[if gte mso 9]>
      </v:textbox></v:rect>
    </td>
    </tr>
    </table>
    <![endif]-->
    


  
  
    <!--[if gte mso 9]>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 600px;">
        <tr>
          <td background="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" valign="top" width="100%">
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 600px;">
        <v:fill type="frame" src="https://cdn.templates.unlayer.com/assets/1707458812957-bg.png" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
      <![endif]-->
  
<div class="u-row-container" style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: 50% 15%;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('images/image-7.png');background-repeat: no-repeat;background-position: 50% 15%;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_image_2" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:60px 10px 0px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-1.png" alt="image" title="image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 80%;max-width: 464px;" width="464" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_1" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px 50px 10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;"><span data-metadata="&lt;!--(figmeta)eyJmaWxlS2V5IjoiNUlNNUVhWWNDdkd2dVViTEJ2ZEMyOSIsInBhc3RlSUQiOjExNTg5MzQ4MTUsImRhdGFUeXBlIjoic2NlbmUifQo=(/figmeta)--&gt;" style="line-height: 19.6px;"></span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspen disse ultrices gravida. Risus commodo viverra </p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Raleway',sans-serif;" align="left">
        
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-right: 0px;padding-left: 0px;" align="center">
      
      <img align="center" border="0" src="images/image-2.gif" alt="Countdown" title="Countdown" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;width: 60%;max-width: 348px;" width="348" class="v-src-width v-src-max-width"/>
      
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align" style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%; margin: 0px;">Here is a coupon code just for you!</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_button_1" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 60px;font-family:'Raleway',sans-serif;" align="left">
        
  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
<div class="v-text-align" align="center">
  <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#9b3445" style="padding:10px 20px;" valign="top"><![endif]-->
    <a href="https://unlayer.com" target="_blank" class="v-button v-size-width" style="box-sizing: border-box; display: inline-block; text-decoration: none; -moz-text-size-adjust: none; text-align: center; color: rgb(255, 255, 255); background: rgb(155, 52, 69); border-radius: 4px; width: 30%; max-width: 100%; word-break: break-word; overflow-wrap: break-word; border-color: rgb(155, 52, 69); border-style: dashed; border-width: 0px; font-family: &quot;Open Sans&quot;, sans-serif; font-size: 14px; line-height: inherit;"><span class="v-padding" style="display:block;padding:10px 20px;line-height:120%;"><span style="line-height: 16.8px;">UNLAYER_123</span></span>
    </a>
    <!--[if mso]></td></tr></table><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  
    <!--[if gte mso 9]>
      </v:textbox></v:rect>
    </td>
    </tr>
    </table>
    <![endif]-->
    


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #9b3445;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
  <div style="background-color: #9b3445;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_social_1" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:60px 10px 10px;font-family:'Raleway',sans-serif;" align="left">
        
<div align="center" style="direction: ltr;">
  <div style="display: table; max-width:167px;">
  <!--[if (mso)|(IE)]><table role="presentation" width="167" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:167px;"><tr><![endif]-->
  
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.facebook.com/unlayer" title="Facebook" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-3.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.linkedin.com/company/unlayer/mycompany/" title="LinkedIn" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-4.png" alt="LinkedIn" title="LinkedIn" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 10px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 10px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://www.instagram.com/unlayer_official/" title="Instagram" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-5.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://twitter.com/unlayerapp" title="X" target="_blank" style="color: rgb(0, 0, 238); text-decoration: underline; line-height: inherit;"><img src="images/image-6.png" alt="X" title="X" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_3" style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:10px 100px 30px;font-family:'Raleway',sans-serif;" align="left">
        
  <div class="v-text-align" style="font-size: 14px; color: #ffffff; line-height: 170%; text-align: center; word-wrap: break-word;">
    <p style="font-size: 14px; line-height: 170%; margin: 0px;">UNSUBSCRIBE   |   PRIVACY POLICY   |   WEB</p>
<p style="font-size: 14px; line-height: 170%; margin: 0px;"></p>
<p style="font-size: 14px; line-height: 170%; margin: 0px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td class="v-container-padding-padding" style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Raleway',sans-serif;" align="left">
        
  <table role="presentation" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
    </td>
  </tr>
  </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>

`;
