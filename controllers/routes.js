var envProd = "https://apidyteg.bsite.net/"
var envLocal = "https://localhost:44345/"

var env = envProd // Base API URL — configurable por proyecto

// --- AUTH ---
var authLoginRoute = env + "api/auth/login"
var authRegisterRoute = env + "api/auth/register"
var authMeRoute = env + "api/auth/me"
var authVerifyRoute = env + "api/auth/verify/[token]"
var authPendingRoute = env + "api/auth/pending"
var authVerifyLinkRoute = env + "api/auth/verify-link/[id]"
var authActivateRoute = env + "api/auth/activate/[id]"
var authProfileRoute = env + "api/auth/profile"
var authPasswordRoute = env + "api/auth/password"

// --- ACADEMY ---
var getAcademyResourcesRoute = env + "api/academy/resources"
var getAcademyResourcesByCategoryRoute = env + "api/academy/resources/[category]"
var getAcademyResourceRoute = env + "api/academy/resources/[id]"
var createAcademyResourceRoute = env + "api/academy/resources"
var updateAcademyResourceRoute = env + "api/academy/resources/[id]"
var deleteAcademyResourceRoute = env + "api/academy/resources/[id]"

// --- ACADEMY CONTENT ---
var getResourceContentRoute = env + "api/academy/resources/[id]/content"
var addResourceContentRoute = env + "api/academy/resources/[id]/content"
var updateContentRoute = env + "api/academy/content/[id]"
var reorderContentRoute = env + "api/academy/content/reorder"
var deleteContentRoute = env + "api/academy/content/[id]"
var getContentFileRoute = env + "api/content/file/[id]"

// --- ACADEMY LESSONS ---
var getResourceLessonsRoute = env + "api/academy/resources/[id]/lessons"
var addResourceLessonRoute = env + "api/academy/resources/[id]/lessons"
var updateLessonRoute = env + "api/academy/lessons/[id]"
var deleteLessonRoute = env + "api/academy/lessons/[id]"

// --- PAYMENTS (Conekta) ---
var paymentConfigRoute = env + "api/payment/config"
var paymentCheckoutRoute = env + "api/payment/checkout"
var paymentStatusRoute = env + "api/payment/status/[id]"
var paymentWebhookRoute = env + "api/payment/webhook"
var paymentAdminRoute = env + "api/payment/admin"
var paymentMineRoute = env + "api/payment/mine"

// --- UPLOAD ---
var uploadImageRoute = env + "api/upload/image"
var uploadDocumentRoute = env + "api/upload/document"

// --- PROJECTS ---
var getProjectsRoute = env + "api/projects"
var getProjectByIdRoute = env + "api/projects/[id]"
var createProjectRoute = env + "api/projects"
var updateProjectRoute = env + "api/projects/[id]"
var deleteProjectRoute = env + "api/projects/[id]"
var approveProjectRoute = env + "api/projects/[id]/approve"
var getProjectContentRoute = env + "api/projects/[id]/content"
var addProjectContentRoute = env + "api/projects/[id]/content"
var updateProjectContentRoute = env + "api/project-content/[id]"
var reorderProjectContentRoute = env + "api/project-content/reorder"
var deleteProjectContentRoute = env + "api/project-content/[id]"
var getProjectFileRoute = env + "api/project-content/file/[id]"
var getProjectThreadRoute = env + "api/projects/[id]/thread"
var addProjectThreadCommentRoute = env + "api/projects/[id]/thread/comment"

// --- TICKETS ---
var getUserTicketsRoute = env + "api/tickets"
var getTicketByIdRoute = env + "api/tickets/[id]"
var createTicketRoute = env + "api/tickets"
var updateTicketStatusRoute = env + "api/tickets/[id]/status"
var getTicketCommentsRoute = env + "api/tickets/[id]/comments"
var addTicketCommentRoute = env + "api/tickets/[id]/comments"
var getAdminTicketsRoute = env + "api/admin/tickets"
var getAdminTicketStatsRoute = env + "api/admin/tickets/stats"

// --- USERS ---
var getClientsRoute = env + "api/users/clients"

// --- TESTIMONIALS ---
var getTestimonialsRoute = env + "api/testimonials"
var getProjectTestimonialRoute = env + "api/testimonials/project/[id]"
var createTestimonialRoute = env + "api/testimonials"

// --- CONTACT ---
var contactSubmitRoute = env + "api/contact"
var getContactInquiriesRoute = env + "api/contact"
var markContactAsReadRoute = env + "api/contact/[id]/read"
var deleteContactInquiryRoute = env + "api/contact/[id]"
