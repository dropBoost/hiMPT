// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faFacebook, faInstagram, faTiktok, faWhatsapp } from "@fortawesome/free-brands-svg-icons"
// import { faEnvelope, faSquarePhone, faGauge, faPhotoFilm, faCalendar, faKeyboard, faFolderOpen } from '@fortawesome/free-solid-svg-icons'

import { FaFacebookSquare, FaWhatsappSquare, AiFillTikTok, FaInstagramSquare, FaPhoneSquareAlt, FaEnvelope, FaUser, FaFileInvoiceDollar, FaUsers, FaArchive } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoFitnessSharp, IoAnalyticsSharp  } from "react-icons/io5";
import { BiSolidReport } from "react-icons/bi";



const ICONfacebook = <FaFacebookSquare/>
const ICONwhatsApp = <FaWhatsappSquare/>
const ICONtikTok = <AiFillTikTok/>
const ICONinstagram = <FaInstagramSquare/>
const ICONtel = <FaPhoneSquareAlt/>
const ICONemail = <FaEnvelope/>

const ICONone = <MdDashboard/>
const ICONtwo = <FaUser/>
const ICONthree = <FaFileInvoiceDollar />
const ICONfour = <FaUsers/>
const ICONfive = <IoFitnessSharp/>
const ICONsix = <BiSolidReport/>
const ICONseven = <IoAnalyticsSharp/>
const ICONeight = <FaArchive/>

// FOOTER SIGN
export const poweredBy = "powered 💜 dropboost.it"

// PERSONALIZZAZIONI

export const companyName = "SEBA MOCCIA - Photography"
export const logoDark = "/logo-black.png"
export const logoLight = "/logo-white.png"
export const logoFullDark = "/logo-fullblack.png"
export const logoFullLight = "/logo-fullwhite.png"
export const logoExtendedDark = "/logo-extended-black.png"
export const logoExtendedLight = "/logo-extended-white.png"
export const logoExtendedFullDark = "/logo-extended-fullblack.png"
export const logoExtendedFullLight = "/logo-extended-fullwhite.png"
export const colorBrand = "#00597d"
export const colorDark = "#222222"
export const whatsAppContactLink = "#"
export const emailContact = "info@sebamoccia.it"

// SOCIAL

export const socialLink = [
    {name:'whatsApp',link:whatsAppContactLink,icon: ICONwhatsApp, info:"+39 366 35 85 395",attivoWeb:"true"},
    {name:'facebook',link:'fasc',icon: ICONfacebook, info:"@facebbok",attivoWeb:"true"},
    {name:'instagram',link:'#',icon: ICONinstagram, info:"@instagram",attivoWeb:"true"},
    {name:'tiktok',link:'#',icon: ICONtikTok, info:"@tiktok",attivoWeb:"false"},
    {name:'email',link:'#',icon: ICONemail, info:"info@sebamoccia.it",attivoWeb:"true"},
    {name:'tel',link:'dsda',icon: ICONtel, info:"+393293968096",attivoWeb:"true"},
  ]

// MODULI GESTIONALE

export const moduliGestionale = [
    {name:'dashboard', link:'/gestionale/dashboard', linkActive:'dashboard', icon: ICONone, label:'dashboard', attivo:'true'},
    {name:'customer', link:'/gestionale/customer', linkActive:'customer', icon: ICONtwo, label:'customer', attivo:'true'},
    {name:'plan', link:'/gestionale/plan', linkActive:'plan', icon: ICONthree, label:'plan', attivo:'true'},
    {name:'team', link:'/redazione/team', linkActive:'team', icon: ICONfour, label:'team', attivo:'true'},
    {name:'workout', link:'/gestionale/workout', linkActive:'workout', icon: ICONfive, label:'workout', attivo:'true'},
    {name:'progress', link:'/gestionale/progress', linkActive:'progress', icon: ICONsix, label:'progress', attivo:'true'},
    {name:'report', link:'/gestionale/report', linkActive:'report', icon: ICONseven, label:'report', attivo:'true'},
    {name:'archivio', link:'/gestionale/archivio', linkActive:'archivio', icon: ICONeight, label:'archivio', attivo:'true'},
  ]

