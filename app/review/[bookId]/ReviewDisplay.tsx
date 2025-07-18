"use client"
import { getBookDetail } from '@/actions/getBooks'
import { addReview } from '@/actions/review'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {format , differenceInDays} from "date-fns"



const ReviewDisplay = ({ bookId } : {bookId : string}) => {
  const router = useRouter()
  const [ addReviewToggle, setAddReviewToggle ] = useState<boolean>(false)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [loadPage , setLoadPage ] = useState<boolean>(false)
  const [reviewLoading, setReviewLoading] = useState<boolean>(true)
  const [reviews, setReviews ] = useState<any>([])
  const [reviewContent, setReviewContent ] = useState<string>("")
  const [bookDetail, setBookDetail] = useState({
    book_name: "Book Name",
    id: "1",
    userId: "user123",
    author_name: "Anonymous",
    imageUrl: "https://dhmckee.com/wp-content/uploads/2018/11/defbookcover-min.jpg",
    description: "This is the default description",
    reviews :[{
      content : "sample"
    }]
  })

  useEffect(()=>{
    async function fetch(){
        setReviewLoading(true)
        const details : any = await getBookDetail(bookId)
        console.log(details.reviews)
        console.log(details)
        setBookDetail(details)
        setReviewLoading(false)
        setReviews(details.reviews)
    }
    fetch()
  },[loadPage])
  return (
    <div className='w-full bg-gray-50'>
      <div className='py-14 mx-10 flex flex-col lg:flex-row justify-center   gap-12 overflow-y-auto'>
        {/* Left Half - Book Details */}
        <div className='w-full lg:w-1/2 flex flex-col items-center overflow-y-auto'>
          <BookDetailCard
            name={bookDetail.book_name}
            author={bookDetail.author_name}
            description={bookDetail.description}
            imageUrl={bookDetail.imageUrl}
          />
        </div>
        {/* Right Half - Reviews */}
        <div className='w-full lg:w-1/2 flex flex-col h-full'>
        <div className='flex justify-between px-4 md:px-8 lg:px-12 items-center'>
          <h2 className='text-xl md:text-2xl font-medium mb-6 text-gray-800'>Reader's POV</h2>
          <Button className="cursor-pointer text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl transition-all duration-200 rounded-lg px-5 py-2.5 font-medium mb-3" onClick={async ()=>{
            console.log(reviewContent)
            if(!addReviewToggle) setAddReviewToggle(true)
            else { 
              setLoading(true)
              if(reviewContent !== "") await addReview(bookId , reviewContent)
              setLoading(false)
              setAddReviewToggle(false)
              setReviewContent("")
              setLoadPage(!loadPage)
            }
          }}>{addReviewToggle ? (loading ? <p className='text-sm md:text-md '>Adding...</p>: <p className='text-sm md:text-md '>Submit</p>) : <p className='text-sm md:text-md '>Add Review</p>}</Button>
        </div>
          <div className='flex-1 overflow-y-auto pr-4 space-y-4 h-full'>
            {addReviewToggle && (
              <Textarea placeholder='Write your review...' onChange={(e)=>setReviewContent(e.target.value)}/>
            )}
            {reviewLoading && [0,0,0,0,0].map(()=>(
              <SkeletonDemo/>
            ))}
            {(!reviewLoading && reviews && reviews.length != 0) ?
              reviews.map((review : any) => (
                <ReviewCard key={review.id} review={review} />
              ))
              :( !reviewLoading && 
                <div className='w-full h-1/2 flex justify-center items-center text-lg md:text-xl text-gray-600 font-semibold'>No Reviews Found</div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function BookDetailCard({ name, author, description, imageUrl } : any) {
  const [showMore, setShowMore] = useState(false);
  const maxDescriptionLength = 200;
  const isLongDescription = description.length > maxDescriptionLength;
  const displayedDescription = showMore || !isLongDescription
    ? description
    : description.slice(0, maxDescriptionLength) + "...";

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-y-auto border border-gray-200 bg-white">
      {/* Image section - larger for better visibility */}
      <div className="w-full h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain object-center"
        />
      </div>
      
      {/* Content section */}
      <div className="w-full flex flex-col items-start p-6 gap-3">
        <h2 className="font-bold text-xl text-gray-800 w-full break-words">{name.charAt(0).toUpperCase() + name.slice(1)}</h2>
        <h4 className="font-medium text-sm text-gray-600 w-full break-words">by {author.charAt(0).toUpperCase() + author.slice(1)}</h4>
        <p className="text-sm text-gray-800 leading-relaxed w-full whitespace-pre-line">
          {displayedDescription.charAt(0).toUpperCase() + displayedDescription.slice(1)}
        </p>
        {isLongDescription && (
          <Button
            size="sm"
            variant="outline"
            className="w-fit text-xs mt-2 px-3"
            onClick={() => setShowMore((prev) => !prev)}
          >
            {showMore ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function ReviewCard({ review } :any) {
  const renderStars = (rating = 4) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const reviewDate = new Date(review.createdAt)
  const daysAgo = differenceInDays(new Date(), reviewDate)
  return (
    <Card className="p-4 border border-gray-200 bg-white shadow-sm ">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* <img src={review.} alt="user" /> */}
          <h4 className="font-semibold text-sm text-gray-600">{review.creatorName.charAt(0).toUpperCase()+review.creatorName.slice(1) || "anonymous"}</h4>
          {/* <div className="flex">
            {renderStars(review.rating)}
          </div> */}
        </div>
        <span className="text-xs text-gray-500">
          {daysAgo < 30
            ? `${daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`}`
            : format(reviewDate, "MMM d, yyyy")}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
    </Card>
  );
}

export default ReviewDisplay


import { Skeleton } from "@/components/ui/skeleton"

function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
