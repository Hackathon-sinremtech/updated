import { useEffect, useState } from 'react';
import { 
  CalendarIcon, 
  XCircleIcon, 
  CheckBadgeIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import supabase from '../../config/supabase';
import { useNavigate } from 'react-router';

// Helper component to display doctor's image or fallback initials SVG
const DoctorImage = ({ image, name }) => {
  const [hasImageError, setHasImageError] = useState(false);

  // Helper to get initials from the doctor's name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n.charAt(0).toUpperCase()).join('');
  };

  return (
    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
      {hasImageError || !image ? (
        <svg
          className="w-full h-full bg-blue-100 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <text
            x="50%"
            y="50%"
            fontWeight="500"
            fontSize="30"
            textAnchor="middle"
            dy=".3em"
            fill="oklch(0.546 0.245 262.881)"
          >
            {getInitials(name)}
          </text>
        </svg>
      ) : (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      )}
    </div>
  );
};

const AppointmentsPage = () => {
  // Tab state: 'upcoming' or 'past'
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
        // Get the current authenticated user
        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Error fetching user:', userError.message);
        } else if (user) {
            // Query the `patient` table where the email matches the authenticated user's email
            const { data, error } = await supabase
                .from('appointment_schedule')
                .select('*')

            if (error) {
                console.error('Error fetching patient data:', error.message);
            } else {
                setAppointments(data);
            }
        } else {
            console.error('No authenticated user found');
        }
    };

    
    fetchPatientData();
}, []);

  // Update appointment status to 'cancelled'
  const cancelAppointment = async (appointmentId) => {
    const { error } = await supabase
      .from('appointment_schedule')
      .update({ appointment_status:"cancelled" })
      .eq('id', appointmentId);

    if (error) {
      console.error('Update failed:', error);
    } else {
      navigate('/Doctors')
    }
  };

  // Upcoming: appointments that are not cancelled or completed
  const upcomingAppointments = appointments.filter(a => 
    a.appointment_status !== 'cancelled' && a.appointment_status !== 'completed'
  );
  // Past: appointments that are either completed or cancelled
  const pastAppointments = appointments.filter(a => 
    a.appointment_status === 'completed' || a.appointment_status === 'cancelled'
  );

  return (
    <div className="min-h-screen pt-30 bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Your Appointments</h1>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            Upcoming Appointments
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            Appointment History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div className="grid gap-6">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-4">
                  {/* Use DoctorImage component for image fallback */}
                  <DoctorImage image="/avatar.png" name={appointment.doctor_name} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{appointment.doctor_name}</h3>
                    <p className="text-gray-600">{appointment.specialty}</p>
                    {appointment.reason && (
                      <p className="text-gray-500 text-sm">Reason: {appointment.reason}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {appointment.apppointment_status === 'confirmed' ? (
                        <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClockIcon className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`text-sm ${
                        appointment.status === 'confirmed'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {/* {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)} */}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-900">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{appointment.appointment_time}</p>
                  <button 
                    onClick={() => setSelectedAppointment(appointment)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-gray-600">No upcoming appointments found.</p>
            )}
          </div>
        )}
        {activeTab === 'past' && (
          <div className="grid gap-6">
            {pastAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center gap-4">
                  {/* Use DoctorImage component for image fallback */}
                  <DoctorImage image="/avatar.png" name={appointment.doctor_name} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{appointment.doctor_name}</h3>
                    <p className="text-gray-600">{appointment.doctor_specialization}</p>
                    {appointment.reason && (
                      <p className="text-gray-500 text-sm">Reason: {appointment.reason}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {appointment.status === 'completed' ? (
                        <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClockIcon className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`text-sm ${
                        appointment.status === 'cancelled'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {appointment.appointment_status.charAt(0).toUpperCase() + appointment.appointment_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-900">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{appointment.appointment_time}</p>
                  {/* No cancellation button for past appointments */}
                </div>
              </div>
            ))}
            {pastAppointments.length === 0 && (
              <p className="text-gray-600">No past appointments found.</p>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your appointment with{' '}
              <span className="font-semibold">{selectedAppointment.doctor_name}</span>{' '}
              on {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}?
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setSelectedAppointment(null)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Go Back
              </button>
              <button 
                onClick={() => cancelAppointment(selectedAppointment.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;