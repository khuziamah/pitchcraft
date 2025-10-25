// // supabase/functions/upload-image/index.ts

// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// // Yeh function chalega jab React app isay call karegi
// serve(async (req) => {
//   try {
//     // Step 1: React app se bheja hua Data URL hasil karo
//     const { fileDataURL } = await req.json()

//     // Step 2: Supabase secrets se Cloudinary ka Cloud Name hasil karo
//     const CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    
//     // Step 3: Cloudinary ka upload URL tayyar karo
//     const uploadURL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

//     // Step 4: Ek form tayyar karo jismein file aur preset honge
//     const formData = new FormData()
//     formData.append('file', fileDataURL)
//     formData.append('upload_preset', 'pitchcraft_preset') // <-- YAHAN APNA PRESET NAAM DAALEIN (jo aapne banaya tha)

//     // Step 5: Cloudinary ke server par file bhejo
//     const response = await fetch(uploadURL, { 
//       method: 'POST', 
//       body: formData 
//     })
    
//     const data = await response.json()

//     // Agar Cloudinary se error aaye, to usay handle karo
//     if (data.error) {
//       throw new Error(data.error.message)
//     }

//     // Step 6: Agar sab theek hai, to image ka secure URL wapis React app ko bhejo
//     return new Response(
//       JSON.stringify({ url: data.secure_url }), 
//       { headers: { 'Content-Type': 'application/json' } }
//     )

//   } catch (error) {
//     // Agar koi bhi masla ho, to error wapis bhejo
//     return new Response(
//       JSON.stringify({ error: error.message }), 
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     )
//   }
// })
// supabase/functions/upload-image/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './cors.ts'
serve(async (req) => {
  // CORS ka special request handle karein (yeh zaroori hai)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileDataURL } = await req.json()
    const CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const uploadURL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

    const formData = new FormData()
    formData.append('file', fileDataURL)
    formData.append('upload_preset', 'pitchcraft_preset') 

    const response = await fetch(uploadURL, { method: 'POST', body: formData })
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    
    // Jawab bhejte waqt bhi CORS headers lagayein
    return new Response(JSON.stringify({ url: data.secure_url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})