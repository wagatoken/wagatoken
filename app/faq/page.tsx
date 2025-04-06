import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQPage = () => {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b border-border">
          <AccordionTrigger className="text-foreground">What is this website about?</AccordionTrigger>
          <AccordionContent className="text-foreground">
            This website is a platform for sharing and discovering AI prompts.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-b border-border">
          <AccordionTrigger className="text-foreground">How do I submit a prompt?</AccordionTrigger>
          <AccordionContent className="text-foreground">
            You can submit a prompt by creating an account and using the "Submit Prompt" feature.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="border-b border-border">
          <AccordionTrigger className="text-foreground">Is there a cost to use this website?</AccordionTrigger>
          <AccordionContent className="text-foreground">No, this website is free to use.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default FAQPage

